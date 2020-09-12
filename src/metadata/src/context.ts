import { Request } from 'express';
import { DecodedToken } from '@me/common/utils/auth';

export type Context = {
  req: Request;
  user?: DecodedToken;
};
