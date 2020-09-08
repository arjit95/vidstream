import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';

import { UserResolver, VideoResolver, ChannelResolver } from './resolvers';
import { Adapter } from '@me/common/db/adapter';
import { buildSchema } from 'type-graphql';

async function main() {
  const schema = await buildSchema({
    resolvers: [UserResolver, VideoResolver, ChannelResolver],
  });

  const app = express();
  const server = new ApolloServer({ schema });
  server.applyMiddleware({
    app,
    path: '/api/metadata',
    cors: {
      credentials: true,
      origin: process.env.CONFIG_CORS_ALLOWED_ORIGINS,
    },
  });

  app.get('/_healthz', function(req: Request, res: Response) {
    res.send('ok');
  });

  await Adapter.createConnection();
  app.listen(parseInt(process.env.CONFIG_HTTP_PORT), '0.0.0.0');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
