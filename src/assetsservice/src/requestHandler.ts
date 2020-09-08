import { existsSync, createReadStream } from 'fs';
import { resolve } from 'path';

import Mime from 'mime/Mime';
import mime from 'mime';
import { FastifyReply, FastifyRequest } from 'fastify';

const typeMap: { [key: string]: Array<string> } = {
  'audio/aac': ['aac'],
  'video/mp4': ['m4s'],
};

const customMime = new Mime(typeMap);

function handleRequest(res: FastifyReply, rPath: string): void {
  if (!existsSync(rPath)) {
    res
      .code(404)
      .type('text/html')
      .send('Not Found');
    return;
  }

  const mimeType = customMime.getType(rPath) || mime.getType(rPath);
  if (mimeType) {
    res.type(mimeType);
  } else {
    res
      .code(500)
      .type('text/html')
      .send('Internal server error');
    return;
  }

  const stream = createReadStream(rPath);
  res.send(stream);
}

export default function(
  baseDir: string,
  queryParams: Array<string> = [],
  requestParams: Array<string> = []
) {
  return function(req: FastifyRequest, res: FastifyReply) {
    let path: Array<string> = [];
    if (queryParams.length) {
      const qp: { [key: string]: string } = req.query as {
        [key: string]: string;
      };
      path = path.concat(queryParams.map(param => qp[param]));
    }

    if (requestParams.length) {
      const rp: { [key: string]: string } = req.params as {
        [key: string]: string;
      };
      path = path.concat(requestParams.map(param => rp[param]));
    }

    const resPath = resolve.apply(null, [baseDir, ...path]);
    handleRequest(res, resPath);
  };
}
