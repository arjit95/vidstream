const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream');

const crypto = require('crypto');
const Busboy = require('busboy');
const http = require('http');

const Queue = require('../common/node/queue');
let queueService;

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const TRANSCODE_QUEUE = process.env.TRANSCODE_QUEUE || 'transcode_queue';

function makeid(len) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (let i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

function upload(req, res) {
    let savedFileName, parser;
    
    try {
        parser = new Busboy({headers: req.headers});
    } catch(err) {
        res.statusCode = 500;
        res.write('Error while parsing headers');
        res.end();
        return;
    }

    parser.on('file', function(field, file, filename) {
        const ext = path.extname(filename);
        savedFileName = crypto.createHash('md5').update((filename + Date.now().toString().substring(5) + makeid(5))).digest('hex');
        savedFileName = savedFileName.substring(savedFileName.length - 10) + ext; 
        console.info("Generated file " + savedFileName);

        pipeline(
            file,
            fs.createWriteStream(path.resolve(UPLOAD_DIR, savedFileName)),
            (err) => {
                if (err) {
                    res.writeHead(500);
                    res.write('Unable to save file');
                    fs.unlinkSync(savedFileName);
                    res.end();
                    console.log(pumpErr);
                }
            }
        );
    });

    parser.on('finish', function() {
        if (res.headersSent) {
            return;
        }

        console.debug('Upload completed');
        queueService.enqueue(TRANSCODE_QUEUE, {name: savedFileName});
        res.statusCode = 200;
        res.end();
    });

    req.pipe(parser);
}

const server = http.createServer(function(req, res) {
    switch(req.url) {
        case '/api/upload/echo':
        case '/_healthz':
            res.statusCode = 200;
            res.write('ok');
            res.end();
            break;
        case '/api/upload':
            upload(req, res);
            break;
        default:
            res.statusCode = 404;
            res.write('not found');
            res.end();
    }
});

const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', async function() {
    console.log("Server running on " + port);

    queueService = await Queue.newBuilder(process.env.QUEUE_SERVICE, process.env.QUEUE_USERNAME, process.env.QUEUE_PASSWORD);
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR);
    }

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