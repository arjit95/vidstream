import http from 'http';
import { Queue } from '@me/common/utils/queue';
import { Transcoder } from './api/transcoder';

const port = parseInt(process.env.CONFIG_HTTP_PORT);
const CONVERT_QUEUE = process.env.CONFIG_CONVERT_QUEUE;
const TRANSCODE_QUEUE = process.env.CONFIG_TRANSCODE_QUEUE;
let queueService: Queue;

const server = http.createServer(function(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  switch (req.url) {
    case '/echo':
    case '/_healthz':
      res.write('ok');
      res.end();
      break;
  }
});

server.listen(port, '0.0.0.0', async function() {
  queueService = await Queue.newBuilder();
  queueService.assert(CONVERT_QUEUE);
  queueService.assert(TRANSCODE_QUEUE);

  queueService.consume(TRANSCODE_QUEUE, Transcoder(queueService));
});

function exitHandler() {
  try {
    console.log('Closing connection');
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
