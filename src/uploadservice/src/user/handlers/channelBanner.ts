import { resolve } from 'path';
import {Channel} from './channel';

export class ChannelBanner extends Channel {
  constructor() {
    super(resolve(process.env.CONFIG_ASSETS_DIRECTORY, 'channel-banners'));
  }
}
