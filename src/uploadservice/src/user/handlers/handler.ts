import { resolve } from 'path';
import fs from 'fs';
import { RequestHandler, UploadContext, UserUploadFields } from '../../upload_interface';

export class Handler implements RequestHandler {
  basePath: string;
  generatedName: string | null;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.generatedName = null;

    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, {recursive: true});
    }
  }

  onStream(context: UploadContext): fs.WriteStream | null {
    this.generatedName = context.fields.id + '.png';
    return fs.createWriteStream(resolve(this.basePath, this.generatedName));
  }

  async onError(): Promise<void> {
    if (this.generatedName && fs.existsSync(this.generatedName)) {
      fs.unlinkSync(this.generatedName);
    }
  }

  async validate(context: UploadContext): Promise<void> {
    const fields: UserUploadFields = context.fields as UserUploadFields;
    if (!fields.token) {
      throw new Error('Please supply a user token');
    }
  }
}
