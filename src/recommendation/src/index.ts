import express, { Request, Response } from 'express';
import logger from 'fluent-logger';
import { Metrics } from '@me/common/metrics';
import { Adapter as DBAdapter } from '@me/common/db/adapter';
import { ApolloServer } from 'apollo-server-express';
import { Auth } from '@me/common/utils/auth';
import { buildSchema } from 'type-graphql';
import { authChecker } from './auth';
import { SearchResolver, Recommendation } from './resolvers';

const u = new URL(process.env.CONFIG_LOGGER_SERVICE);

logger.configure('metrics_service', {
  host: u.hostname,
  port: parseInt(u.port),
  timeout: 3.0,
  reconnectInterval: 600000,
});

async function start() {
  const schema = await buildSchema({
    resolvers: [SearchResolver, Recommendation],
    authChecker,
  });

  const app = express();
  const metrics = await Metrics.getInstance();
  await DBAdapter.createConnection();

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const response = {
        req,
        metrics,
        logger,
        user: null,
      };

      if (!req.headers.authorization) {
        return response;
      }

      const [authType, token] = (req.headers.authorization || '').split(' ');
      if (authType !== 'Bearer') {
        return response;
      }

      try {
        const user = Auth.decodeToken(token);
        return { req, user, metrics, logger };
      } catch (err) {
        return response;
      }
    },
  });

  server.applyMiddleware({
    app,
    path: '/api/recommendation',
    cors: {
      credentials: true,
      origin: process.env.CONFIG_CORS_ALLOWED_ORIGINS,
    },
  });

  app.get('/_healthz', function(req: Request, res: Response) {
    res.send('ok');
  });

  app.listen(parseInt(process.env.CONFIG_HTTP_PORT), '0.0.0.0');
}

start()
  .then(() => {
    console.log('Recommendation service is running');
  })
  .catch(err => {
    console.error('Cannot start recommendation service');
    console.log(err.stack);
    console.error(JSON.stringify(err, null, 4));
    process.exit(1);
  });
