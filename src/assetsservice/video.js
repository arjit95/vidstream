const path = require('path');

const file = require('./file');
const baseDir = process.env.CONVERTED_DIR;

const endpoints = {
    '/api/assets/video': (req) => path.resolve(baseDir, req.query.stream),
    '/api/assets/video/image/:id/:type': (req) => path.resolve(baseDir, req.params.id, req.params.type)
};

function handleRequest(endpoint, mode = 'get') {
    return function (req, res) {
        const rPath = endpoints[endpoint](req);
        const handler = mode === 'get' ? file.handleFileRequest : file.handleHeadRequest;
        handler(res, rPath);
    }
}

module.exports = function (instance, opts, done) {
    for (let endpoint in endpoints) {
        instance.get(endpoint, handleRequest(endpoint));
        instance.head(endpoint, handleRequest(endpoint, 'head'));
    }

    done();
};