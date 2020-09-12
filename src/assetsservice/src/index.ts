import { fastify as Fastify } from 'fastify';
import { resolve } from 'path';
import requestHandler from './requestHandler';
import {Adapter as DBAdapter} from '@me/common/db/adapter';
import {Metrics} from '@me/common/metrics';
import videoDelete from './videoDeleteHandler';

const ASSETS_DIR = process.env.ASSETS_DIR || './assets';
const profileDirectory = resolve(ASSETS_DIR, 'profiles');
const profileBanners = resolve(ASSETS_DIR, 'profile-banners');
const channelDirectory = resolve(ASSETS_DIR, 'channels');
const channelBanner = resolve(ASSETS_DIR, 'channel-banners');

const fastify = Fastify({ logger: true });

fastify.get('/_healthz', { logLevel: 'debug' }, async () => {
  return 'ok';
});

fastify.get(
  '/api/assets/user/profile',
  requestHandler(profileDirectory, ['id'])
);

fastify.get(
  '/api/assets/user/profile/banner',
  requestHandler(profileBanners, ['id'])
);

fastify.get('/api/assets/channel', requestHandler(channelDirectory, ['id']));
fastify.get(
  '/api/assets/channel/banner',
  requestHandler(channelBanner, ['id'])
);
fastify.get(
  '/api/assets/video',
  requestHandler(process.env.CONFIG_CONVERTED_DIRECTORY, ['stream'])
);
fastify.get(
  '/api/assets/video/image/:id/:type',
  requestHandler(process.env.CONFIG_CONVERTED_DIRECTORY, [], ['id', 'type'])
);

fastify.register(videoDelete);

const start = async () => {
  const port = parseInt(process.env.CONFIG_HTTP_PORT);
  await DBAdapter.createConnection();
  await Metrics.getInstance();

  await fastify.listen(port, '0.0.0.0');
};

start();
