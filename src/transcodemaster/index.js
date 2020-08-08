const http = require('http');

const queue = require('../common/node/queue');

const port = process.env.PORT || 8080;
const CONVERT_QUEUE = process.env.CONVERT_QUEUE;
const TRANSCODE_QUEUE = process.env.TRANSCODE_QUEUE;
let queueService;

const server = http.createServer(function(req, res) {
    switch(req.url) {
        case '/echo':
        case '/_healthz':
            res.write('ok');
            res.end();
            break;
    }
});

server.listen(port, '0.0.0.0', async function() {
    queueService = await queue.newBuilder(process.env.QUEUE_SERVICE, process.env.QUEUE_USERNAME, process.env.QUEUE_PASSWORD);
    queueService.assert(CONVERT_QUEUE);
    queueService.assert(TRANSCODE_QUEUE);

    queueService.consume(TRANSCODE_QUEUE, require('./api/transcoder')(queueService));
});


function exitHandler() {
    try {
        console.log("Closing connection");
        if (queueService) {
            queueService.disconnect();
        }
    } catch (err) {}
    

    process.exit(0);
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
