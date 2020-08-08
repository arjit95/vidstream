const http = require('http');

const queue = require('../common/node/queue');
const CONVERT_QUEUE = process.env.CONVERT_QUEUE;
const Executor = require('../common/node/executor');

const port = process.env.PORT || 8080;

let queueService;

function debounce(timeout, cb) {
    let timer, self = this;
    let debounced = {
        stop: function() {
            clearTimeout(timer);
            timer = null;
        },

        start: function() {
            let args = arguments;
            timer = setTimeout(() => cb.apply(self, args), timeout);
        }
    };

    return debounced;
}

// Send message after 5s if there are no more videos
let enqueued = debounce(5000, function(context) {
    queueService.enqueue(process.env.REDUCE_QUEUE, {context});
});

async function encode(message) {
    enqueued.stop();
    try {
        await Executor.exec(message.command);
    } catch(err) {
        console.dir(message);
        return;
    }
    
    enqueued.start(message.context);
}

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