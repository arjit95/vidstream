const util = require('util');
const pipeline = util.promisify(require('stream').pipeline);

const Busboy = require('busboy');
const http = require('http');
const url = require('url');

const Queue = require('../common/node/queue');
let queueService;

const TRANSCODE_QUEUE = process.env.TRANSCODE_QUEUE || 'transcode_queue';

const User = require('./user');
const Video = require('./video');

/**
 * Single wrapper around the upload utils
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 * @param {import('./upload.d').MethodResponse} uploadCb
 */
async function upload(req, res, uploadCb) {
    let parser;
    
    try {
        parser = new Busboy({headers: req.headers});
    } catch(err) {
        res.statusCode = 500;
        res.write('Error while parsing headers');
        res.end();
        return;
    }

    const context = {
        queue: queueService,
        fields: {},
        req
    };

    parser.on('field', function(name, value) {
        context.fields[name] = value;
    });

    let error;
    parser.on('file', async function(field, file, filename) {
        const ws = uploadCb.onStream({...context, filename});
        pipeline(file, ws).catch(err => error = err);
    });

    parser.on('finish', async function() {
        try {
            if (error) {
                throw error;
            }
            
            await uploadCb.validate?.(context);
            await uploadCb.onFinish?.(context);
        } catch(err) {
            if (typeof uploadCb.onError === 'function') {
                await uploadCb.onError(context)
            }

            res.statusCode = 500;
            res.write(err.message);
            return res.end();
        }

        res.statusCode = 200;
        res.end();
    });

    req.pipe(parser);
}

const server = http.createServer(function(req, res) {
    const userFn = {
        '/api/upload/video': Video.upload,
        '/api/upload/user/profile': User.profile,
        '/api/upload/user/channel': User.channel,
        '/api/upload/user/channel/banner': User.channelBanner
    };

    const pathname = url.parse(req.url, true).pathname
    if (pathname === '/_healthz') {
        res.statusCode = 200;
        res.write('ok');
        return res.end();
    }

    if (userFn[pathname]) {
        const method = userFn[pathname];
        return upload(req, res, method());
    }

    res.statusCode = 404;
    res.write('not found');
    res.end();
});

const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', async function() {
    console.log("Server running on " + port);

    queueService = await Queue.newBuilder(process.env.QUEUE_SERVICE, process.env.QUEUE_USERNAME, process.env.QUEUE_PASSWORD);
    queueService.assert(TRANSCODE_QUEUE);
});

function exitHandler() {
    try {
        console.log("Closing connection");
        if (queueService) {
            queueService.disconnect();
        }
    } catch (err) {}

    process.exit();
}

//catches ctrl+c event
process.on('SIGINT', exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', function(err) {
    console.log(err);
    exitHandler();
});