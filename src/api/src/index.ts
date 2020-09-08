import http from 'http';
import httpProxy from 'http-proxy';

const proxy: httpProxy = httpProxy.createProxy({});

const availableServices: { [key: string]: string } = {
  upload: process.env.CONFIG_UPLOAD_SERVICE,
  assets: process.env.CONFIG_ASSETS_SERVICE,
  auth: process.env.CONFIG_AUTH_SERVICE,
  metrics: process.env.CONFIG_METRICS_SERVICE,
  metadata: process.env.CONFIG_METADATA_SERVICE,
};

const healthReq = function(_: http.IncomingMessage, res: http.ServerResponse) {
  return res.end('ok');
};

const addCorsHeaders = function(res: http.ServerResponse) {
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.CONFIG_CORS_ALLOWED_ORIGINS
  );
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, DELETE, PUT, HEAD'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

proxy.on('error', function(
  err: Error,
  _: http.IncomingMessage,
  res: http.ServerResponse
): void {
  console.log(err.message);
  res.statusCode = 500;
  addCorsHeaders(res);
  res.end();
});

const onRequest = function(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  if (req.url === '/_healthz') {
    return healthReq(req, res);
  }

  addCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const service = req.url?.split('/').filter(p => !!p)[1];
  if (!service || !(service in availableServices)) {
    res.statusCode = 404;
    return res.end();
  }

  proxy.web(req, res, { target: availableServices[service] });
};

http
  .createServer(onRequest)
  .listen(parseInt(process.env.CONFIG_HTTP_PORT), '0.0.0.0');
