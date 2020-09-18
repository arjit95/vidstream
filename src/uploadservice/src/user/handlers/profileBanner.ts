import { resolve } from 'path';

import {Profile} from './profile';

export class ProfileBanner extends Profile {
  constructor() {
    const assetsDir = process.env.CONFIG_ASSETS_DIRECTORY;
    super(resolve(assetsDir, 'profile-banners'));
  }
}
