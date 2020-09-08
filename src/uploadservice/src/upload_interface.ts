import { IncomingMessage } from 'http';
import { Queue } from '@me/common/utils/queue';
import { WriteStream } from 'fs';

export interface UploadContext {
  queue: Queue;
  fields: { [key: string]: any };
  req: IncomingMessage;
  filename?: string;
}

export interface RequestHandler {
  onStream(context: UploadContext): WriteStream | null;
  onError(context: UploadContext): Promise<void>;
  onFinish?(context: UploadContext): Promise<void>;
  validate?(context: UploadContext): Promise<void>;
}
