import { fastify as Fastify } from 'fastify';
import { resolve } from 'path';
import requestHandler from './requestHandler';

const ASSETS_DIR = process.env.ASSETS_DIR || './assets';
const profileDirectory = resolve(ASSETS_DIR, 'profiles');
const channelDirectory = resolve(ASSETS_DIR, 'channels');
const channelBanner = resolve(ASSETS_DIR, 'channelBanners');

const fastify = Fastify({ logger: true });

fastify.get('/_healthz', { logLevel: 'trace' }, async () => {
  return 'ok';
});

fastify.get(
  '/api/assets/user/profile',
  requestHandler(profileDirectory, ['id'])
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

const start = async () => {
  const port = parseInt(process.env.CONFIG_HTTP_PORT);
  await fastify.listen(port, '0.0.0.0');
};

start();
