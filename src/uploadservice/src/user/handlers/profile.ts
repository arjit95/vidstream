import { resolve } from 'path';

import { Handler } from './handler';

export class Profile extends Handler {
  constructor() {
    const assetsDir = process.env.CONFIG_ASSETS_DIRECTORY;
    super(resolve(assetsDir, 'profiles'));
  }
}
