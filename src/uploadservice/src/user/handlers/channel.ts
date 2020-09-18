import { resolve } from 'path';
import { Handler } from './handler';
import { UploadContext, UserUploadFields } from '../../upload_interface';
import { Auth } from '@me/common/utils';
import {Channel as ChannelModel} from '@me/common/db/models/Channel';

export class Channel extends Handler {
  constructor(dir?: string) {
    dir = dir || resolve(process.env.CONFIG_ASSETS_DIRECTORY, 'channels');
    super(dir);
  }

  async validate(context: UploadContext): Promise<void> {
    await super.validate(context);

    const fields: UserUploadFields = context.fields as UserUploadFields;
    const user = await Auth.getUserFromToken(fields.token);
    ChannelModel.findOneOrFail({
      where: {
        id: fields.id,
        user: {
          username: user.username,
        },
      },
    });
  }
}
