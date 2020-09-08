import { promisify } from 'util';
import { pipeline } from 'stream';
import fs from 'fs';
import http from 'http';
import url from 'url';
import busboy from 'busboy';

import { Queue } from '@me/common/utils/queue';
import * as Video from './video';
import * as User from './user';
import { RequestHandler, UploadContext } from 'upload_interface';
import { Adapter } from '@me/common/db/adapter';

const Pipeline = promisify(pipeline);

let queueService: Queue;

const TRANSCODE_QUEUE = process.env.CONFIG_TRANSCODE_QUEUE;

class FileUploader {
  handler: RequestHandler;
  req: http.IncomingMessage;
  res: http.ServerResponse;
  parser: busboy.Busboy;
  context: UploadContext;
  error?: Error;

  constructor(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    handler: RequestHandler
  ) {
    this.req = req;
    this.res = res;
    this.handler = handler;
    this.parser = new busboy(this.req);

    this.context = {
      queue: queueService,
      fields: {},
      req,
    };

    this.parser.on('field', this.onField.bind(this));
    this.parser.on('file', this.onField.bind(this));
    this.parser.on('finish', this.onFinish.bind(this));
  }

  onField(name: string, value: any) {
    this.context.fields[name] = value;
  }

  onError(error: Error) {
    console.log(error.message);
    if (typeof this.handler.onError === 'function') {
      this.onError(error);
    }

    if (!this.res.headersSent) {
      this.res.statusCode = 500;
      this.res.write('Cannot process uploaded file');
      this.res.end();
    }
  }

  async onFinish() {
    try {
      if (this.error) {
        throw this.error;
      }

      await this.handler.onFinish?.(this.context);
    } catch (err) {
      this.onError(err);
      return;
    }

    this.res.statusCode = 200;
    this.res.end();
  }

  async onFile(_: string, file: fs.ReadStream, filename: string) {
    try {
      await this.handler.validate?.(this.context);
    } catch (err) {
      this.error = err;
      return;
    }

    const ws = this.handler.onStream({ ...this.context, filename });
    if (ws == null) {
      this.error = new Error('Cannot store file');
      return;
    }

    Pipeline(file, ws).catch(err => (this.error = err));
  }

  start() {
    this.req.pipe(this.parser);
  }
}

const getRequestHandler = function(pathname: string): RequestHandler | null {
  switch (pathname) {
    case '/api/upload/video':
      return new Video.Video();
    case '/api/upload/user/profile':
      return new User.Profile();
    case '/api/upload/user/profile/banner':
      return new User.ProfileBanner();
    case '/api/upload/user/channel':
      return new User.Channel();
    case '/api/upload/user/channel/banner':
      return new User.ChannelBanner();
  }

  return null;
};

const server = http.createServer(function(
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  if (!req.url) {
    return;
  }

  const pathname = url.parse(req.url, true).pathname;
  if (pathname === '/_healthz' || !pathname) {
    res.statusCode = 200;
    res.write('ok');
    return res.end();
  }

  const handler: RequestHandler | null = getRequestHandler(pathname);
  if (handler) {
    const uploader = new FileUploader(req, res, handler);
    uploader.start();
    return;
  }

  res.statusCode = 404;
  res.write('not found');
  res.end();
});

const port = parseInt(process.env.CONFIG_HTTP_PORT);
server.listen(port, '0.0.0.0', async function() {
  console.log('Server running on ' + port);

  queueService = await Queue.newBuilder();
  queueService.assert(TRANSCODE_QUEUE);
  await Adapter.createConnection();
});

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
