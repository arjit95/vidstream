import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';

import {
  UserResolver,
  VideoResolver,
  ChannelResolver,
  CommentLikeResolver,
  VideoLikeResolver,
  SubscriptionResolver,
  CommentResolver,
} from './resolvers';
import { Adapter } from '@me/common/db/adapter';
import { Metrics } from '@me/common/metrics/index';
import { Auth } from '@me/common/utils/auth';
import { buildSchema } from 'type-graphql';
import { authChecker } from './auth';

async function main() {
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      VideoResolver,
      ChannelResolver,
      CommentLikeResolver,
      VideoLikeResolver,
      SubscriptionResolver,
      CommentResolver,
    ],
    authChecker,
  });

  const app = express();
  const metrics = await Metrics.getInstance();

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      if (!req.headers.authorization) {
        return { req, user: null };
      }

      const [authType, token] = (req.headers.authorization || '').split(' ');
      if (authType !== 'Bearer') {
        return { req, user: null };
      }

      try {
        const user = Auth.decodeToken(token);
        return { req, user, metrics };
      } catch (err) {
        return { req, user: null, metrics };
      }
    },
  });

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
