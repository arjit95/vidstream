import { IncomingMessage } from 'http';
import { Queue } from '@me/common/utils/queue';
import { WriteStream } from 'fs';

export type UploadContext = {
  queue: Queue;
  fields: { [key: string]: any };
  req: IncomingMessage;
  filename?: string;
}

export interface RequestHandler {
  onStream(context: UploadContext): WriteStream | null;
  onError(): Promise<void>;
  onFinish?(context: UploadContext): Promise<void>;
  validate?(context: UploadContext): Promise<void>;
}

export type UserUploadFields = {
  id: string;
  token: string;
}