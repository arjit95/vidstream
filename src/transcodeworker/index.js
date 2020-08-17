const http = require('http');
const fs = require('fs');

const queue = require('../common/node/queue');
const CONVERT_QUEUE = process.env.CONVERT_QUEUE;
const {Executor} = require('../common/node/utils');

const port = process.env.PORT || 8080;

let queueService;

/**
 * Executes the command received from queue pipeline
 * @param {Object} message
 * @param {string} message.command The command to execute
 * @param {object} message.context Context related to job
 */
async function encode(message) {
    try {
        await Executor.exec(message.command);

        if (message.fileName && fs.existsSync(message.fileName + '.tmp')) {
            fs.unlinkSync(message.fileName + '.tmp');            
        }
    } catch(err) {
        console.log(err);
        return;
    }

    const isPending = fs.readdirSync(message.context.target).some(file => file.endsWith('.tmp'));
    if (!isPending) {
        console.log(`All jobs completed forwarding: ${process.env.REDUCE_QUEUE}`);
        queueService.enqueue(process.env.REDUCE_QUEUE, {context: message.context});
    }
}

/**
 * Starts the worker process, and attaches queue message
 * processor.
 */
async function start() {
    queueService = await queue.newBuilder(process.env.QUEUE_SERVICE, process.env.QUEUE_USERNAME, process.env.QUEUE_PASSWORD);

    queueService.assert(CONVERT_QUEUE);
    queueService.consume(CONVERT_QUEUE, encode);
}

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

const server = http.createServer(function(req, res) {
    switch(req.url) {
        case '/echo':
        case '/_healthz':
            res.write('ok');
            res.end();
            break;
    }
});
server.listen(port, start);