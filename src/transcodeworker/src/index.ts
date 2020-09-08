import http from 'http';
import fs from 'fs';

import { Queue, QueueMessage, Job } from '@me/common/utils/queue';
import { Executor } from '@me/common/utils/executor';

const CONVERT_QUEUE = process.env.CONFIG_CONVERT_QUEUE;
const REDUCE_QUEUE = process.env.CONFIG_REDUCE_QUEUE;

const port = parseInt(process.env.CONFIG_HTTP_PORT);

let queueService: Queue;

async function encode(message: QueueMessage<Job>) {
  try {
    await Executor.exec(message.command);

    if (message.fileName && fs.existsSync(message.fileName + '.tmp')) {
      fs.unlinkSync(message.fileName + '.tmp');
    }
  } catch (err) {
    console.log(err);
    return;
  }

  const isPending = fs
    .readdirSync(message.context.target)
    .some(file => file.endsWith('.tmp'));
  if (!isPending) {
    queueService.enqueue(REDUCE_QUEUE, { context: message.context });
  }
}

/**
 * Starts the worker process, and attaches queue message
 * processor.
 */
async function start() {
  queueService = await Queue.newBuilder();

  queueService.assert(CONVERT_QUEUE);
  queueService.consume(CONVERT_QUEUE, encode);
}

function exitHandler() {
  try {
    console.log('Closing connection');
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
  switch (req.url) {
    case '/echo':
    case '/_healthz':
      res.write('ok');
      res.end();
      break;
  }
});
server.listen(port, start);
