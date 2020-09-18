import { resolve } from 'path';
import { Handler } from './handler';
import { UploadContext, UserUploadFields } from '../../upload_interface';
import { Auth } from '@me/common/utils';

export class Profile extends Handler {
  constructor(dir?: string) {
    const assetsDir = process.env.CONFIG_ASSETS_DIRECTORY;
    dir = dir || resolve(assetsDir, 'profiles')
    super(dir);
  }

  async validate(context: UploadContext): Promise<void> {
    await super.validate(context);

    const fields: UserUploadFields = context.fields as UserUploadFields;
    const user = await Auth.getUserFromToken(fields.token);
    if (user.username !== fields.id) {
      throw new Error('Unauthorized')
    }
  }
}
