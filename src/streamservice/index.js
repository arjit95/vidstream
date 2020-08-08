const fs = require('fs');
const path = require('path');
const Mime = require('mime/Mime');

const fastify = require('fastify')({ logger: true });
const typeMap = {
  'audio/aac': ['aac'],
  'video/mp4': ['m4s']
};

const customMime = new Mime(typeMap);
const mime = require('mime');

const baseDir = process.env.CONVERTED_DIR;

const fileHandler = function(req, res) {
  const qp = req.query.path;
  fastify.log.info(`Reading file for streaming ${qp}`);

  const rPath = path.resolve(baseDir, qp);
  if (!fs.existsSync(rPath)) {
    return res.code(404).type('text/html').send('Not Found');
  }

  const stream = fs.createReadStream(rPath);

  const mimeType = customMime.getType(rPath) || mime.getType(rPath);
  res.type(mimeType);
  res.send(stream);
};

const headRequestHandler = function(req, res) {
  const qp = req.query.path;
  fastify.log.info(`Reading file for streaming ${qp}`);

  const rPath = path.resolve(baseDir, qp);
  if (!fs.existsSync(rPath)) {
    return res.code(404).type('text/html').send('Not Found');
  }

  const stat = fs.statSync(rPath);
  const mimeType = customMime.getType(rPath) || mime.getType(rPath);
  res.type(mimeType);
  res.header('Content-Length', stat.size);
  res.code(204).send();
};

fastify.head('/api/stream/raw', headRequestHandler);
fastify.get('/api/stream/raw', fileHandler);
fastify.options('/api/stream/raw', function(_, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, HEAD');
  res.code(204).send();
});

fastify.get('/_healthz', {logLevel: 'silent'},async (request, reply) => {
  return 'ok';
});

const start = async () => {
    try {
      const port = process.env.PORT || 8080;
      await fastify.listen(port, "0.0.0.0");
      fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
};

start();
  
