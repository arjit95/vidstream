const fastify = require('fastify')({ logger: true });

fastify.register(require('./video'));
fastify.register(require('./user'));

fastify.get('/_healthz', {logLevel: 'silent'}, async (request, reply) => {
  return 'ok';
});

const start = async () => {
    const port = process.env.PORT || 8080;
    await fastify.listen(port, "0.0.0.0");
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
};

start();