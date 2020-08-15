const http = require('http');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxy({});

const availableServices = {
    upload: process.env.UPLOAD_SERVICE_ADDR,
    stream: process.env.STREAM_SERVICE_ADDR,
    auth: process.env.AUTH_SERVICE_ADDR,
    metrics: process.env.METRICS_SERVICE_ADDR
};

/**
 * Handles kubernetes health request
 * @param {http.IncomingMessage} _ 
 * @param {http.ServerResponse} res 
 */
const healthReq = function(_, res) {
    return res.end('ok');
};

const addCorsHeaders = function(req, res) {
   console.log('Adding cors headers');
   res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOWED_ORIGINS);
   res.setHeader('Access-Control-Request-Method', '*');
   res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE, PUT');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
};

/**
 * Acts as a proxy server and forwards any request
 * to internal services.
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const onRequest = function(req, res) {
    if (req.url === '/_healthz') {
        return healthReq(req, res);
    }

    const [_, service] = req.url.split('/').filter(p => !!p);
    const target = availableServices[service];

    addCorsHeaders(req, res);
    if (req.method === 'OPTIONS') {
       res.statusCode = 200;
       return res.end();
    }

    if (!target) {
        res.statusCode = 404;
        return res.end();
    }

    proxy.web(req, res, {target});
}

http.createServer(onRequest).listen(process.env.PORT || 8080, '0.0.0.0');
