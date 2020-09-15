import { Request } from 'express';
import { DecodedToken } from '@me/common/utils/auth';
import { ElasticObj } from '@me/common/metrics/index';

export type Context = {
  req: Request;
  user?: DecodedToken;
  metrics: ElasticObj;
};
