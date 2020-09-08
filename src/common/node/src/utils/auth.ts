import { ObjectType, Field } from 'type-graphql';
import {sign, verify} from 'jsonwebtoken';

export type TokenInfo = {
  username: string;
  email: string;
  name: string;
}

export type DecodedToken = TokenInfo & {
  iat: number;
  exp: number;
};

@ObjectType()
export class AuthToken {
  @Field()
  token!: string;

  @Field({nullable: true})
  refreshToken?: string;

  @Field()
  expiry!: number;
}

export class Auth {
  static async getUserFromToken(token: string): Promise<TokenInfo> {    
    return Auth.decodeToken(token);
  }

  static generateToken(data: TokenInfo, doNotLogout: boolean = true): AuthToken {
    const authToken = new AuthToken();
    authToken.token = sign(data, process.env.SECRET_JWT_TOKEN, {
      expiresIn: '15m'
    });

    authToken.refreshToken = sign(data, process.env.SECRET_JWT_TOKEN, !doNotLogout ? {
      expiresIn: '7 days'
    } : {});

    const date = new Date();
    date.setUTCSeconds(date.getUTCSeconds() + 15 * 60);
    authToken.expiry = date.getTime();

    return authToken;
  }

  static decodeToken(token: string): DecodedToken {
    return verify(token, process.env.SECRET_JWT_TOKEN) as DecodedToken;
  }
}
