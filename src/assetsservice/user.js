const path = require('path');

const file = require('./file');

const ASSETS_DIR = process.env.ASSETS_DIR || './assets';;
const profileDirectory = path.resolve(ASSETS_DIR, 'profiles');
const channelDirectory = path.resolve(ASSETS_DIR, 'channels');
const channelBanner = path.resolve(ASSETS_DIR, 'channelBanners'); 

function handleRequest(endpoint, mode = 'get') {
    return function (req, res) {
        const rPath = endpoints[endpoint](req);
        const handler = mode === 'get' ? file.handleFileRequest : file.handleHeadRequest;
        handler(res, rPath);
    }
}

const endpoints = {
    '/api/assets/user/profile': (req) => path.resolve(profileDirectory, req.query.id),
    '/api/assets/channel': (req) => path.resolve(channelDirectory, req.query.id),
    '/api/assets/channel/banner': (req) => path.resolve(channelBanner, req.query.id),
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