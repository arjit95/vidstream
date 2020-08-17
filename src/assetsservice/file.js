const fs = require('fs');

const Mime = require('mime/Mime');
const typeMap = {
  'audio/aac': ['aac'],
  'video/mp4': ['m4s']
};

const customMime = new Mime(typeMap);
const mime = require('mime');

const handleHeadRequest = function(res, rPath) {
    if (!fs.existsSync(rPath)) {
        return res.code(404).type('text/html').send('Not Found');
    }

    const stat = fs.statSync(rPath);
    const mimeType = customMime.getType(rPath) || mime.getType(rPath);
    res.type(mimeType);
    res.header('Content-Length', stat.size);
    res.code(204).send();
};

const handleFileRequest = function(res, rPath) {
    if (!fs.existsSync(rPath)) {
        return res.code(404).type('text/html').send('Not Found');
    }

    const stream = fs.createReadStream(rPath);
    const mimeType = customMime.getType(rPath) || mime.getType(rPath);
    res.type(mimeType);
    res.send(stream);
};

module.exports = { handleFileRequest, handleHeadRequest };