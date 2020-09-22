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

  constructor(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    handler: RequestHandler
  ) {
    this.req = req;
    this.res = res;
    this.handler = handler;
    this.parser = new busboy({headers: req.headers});

    this.context = {
      queue: queueService,
      fields: {},
      req,
    };

    this.parser.on('field', this.onField.bind(this));
    this.parser.on('file', this.onFile.bind(this));
    this.parser.on('finish', this.onFinish.bind(this));
    this.parser.on('error', this.onError.bind(this));
    this.req.pipe(this.parser);
  }

  onField(name: string, value: any) {
    this.context.fields[name] = value;
  }

  async onError(error: Error) {
    this.req.unpipe(this.parser);
    this.parser.removeAllListeners();

    if (typeof this.handler.onError === 'function') {
      await this.handler.onError();
    }

    if (!this.res.headersSent) {
      this.res.statusCode = 500;
      this.res.setHeader('Content-Type', 'application/json');
      this.res.end(JSON.stringify({error: 'Cannot process uploaded file'}));
    }
  }

  async onFinish() {
    try {
      await this.handler.onFinish?.(this.context);
    } catch (err) {
      this.onError(err);
      return;
    }

    this.res.statusCode = 200;
    this.res.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify({}));
  }

  async onFile(_: string, file: fs.ReadStream, filename: string): Promise<void> {
    try {
      await this.handler.validate?.(this.context);
    } catch (err) {
      this.parser.emit('error', err);
      file.destroy();
      return;
    }

    const ws = this.handler.onStream({ ...this.context, filename });
    if (ws == null) {
      const error = new Error('Cannot store file');
      this.parser.emit('error', error);
      file.destroy(error);
      return;
    }

    return Pipeline(file, ws).catch(err => {
      this.parser.emit('error', err);
    });
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
    res.statusCode = 404;
    return res.end();
  }

  const pathname = url.parse(req.url, true).pathname;
  if (pathname === '/_healthz' || !pathname || req.method !== 'POST') {
    res.statusCode = 200;
    res.write('ok');
    return res.end();
  }

  const handler: RequestHandler | null = getRequestHandler(pathname);
  if (handler) {
    console.log('Found handler');
    new FileUploader(req, res, handler);
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
