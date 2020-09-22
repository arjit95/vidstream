import { Request } from 'express';
import { DecodedToken } from '@me/common/utils/auth';
import { ElasticObj } from '@me/common/metrics/index';
import { Logger } from 'fluent-logger';

export type Context = {
  req: Request;
  user?: DecodedToken;
  metrics: ElasticObj;
  logger: Logger;
};
