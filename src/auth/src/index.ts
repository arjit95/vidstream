import { buildSchema } from 'type-graphql';
import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { Adapter } from '@me/common/db/adapter';
import cookieParser from 'cookie-parser';
import { UserResolver } from './resolvers';

async function main() {
  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  const app = express();
  const server = new ApolloServer({
    schema,
    context: ({ res, req }) => ({
      res,
      req,
    }),
  });

  app.use(cookieParser());
  app.disable('x-powered-by');

  app.get('/_healthz', function(req: Request, res: Response) {
    res.send('ok');
  });

  app.get('/api/auth/logout', function(req: Request, res: Response) {
    console.log(req.cookies['refresh_token']);
    if (req.cookies['refresh_token']) {
      res.clearCookie('refresh_token');
    }

    res.end();
  });

  server.applyMiddleware({
    app,
    path: '/api/auth',
    cors: {
      credentials: true,
      origin: process.env.CONFIG_CORS_ALLOWED_ORIGINS,
    },
  });

  await Adapter.createConnection();
  app.listen(parseInt(process.env.CONFIG_HTTP_PORT), '0.0.0.0');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
