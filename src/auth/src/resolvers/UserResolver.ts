import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  ObjectType,
  Field,
} from 'type-graphql';
import bcrypt from 'bcrypt';

import { User } from '@me/common/db/models/User';
import { Channel } from '@me/common/db/models/Channel';
import { Metrics } from '@me/common/metrics';
import { Common } from '@me/common/utils/common';
import { Auth, AuthToken, DecodedToken } from '@me/common/utils/auth';
import { Response, Request } from 'express';

type Context = {
  res: Response;
  req: Request;
};

const createEntries = async function(
  username: string,
  password: string,
  email: string
) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  const metricsInstance = await Metrics.getInstance();

  await metricsInstance.Users.create({
    name: username,
    username,
    id: username,
  });

  const user = new User();
  user.name = username;
  user.password = hash;
  user.username = username;
  user.email = email;
  user.channel_count = 1;
  await user.save();

  const channel = new Channel();
  channel.title = username;
  channel.user = user;
  channel.id = Common.generateUniqueId(
    `${user.username}:${user.channel_count}`
  );
  await channel.save();

  return user;
};

@ObjectType()
class AuthResponse extends AuthToken {
  @Field()
  username!: string;

  @Field()
  name!: string;
}

@Resolver(User)
export class UserResolver {
  @Mutation(() => AuthResponse)
  async register(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Arg('email') email: string,
    @Ctx() ctx: Context
  ): Promise<AuthResponse> {
    const user = await createEntries(username, password, email);
    const token = await Auth.generateToken({
      username: user.username,
      email: user.email,
      name: user.name,
    });

    ctx.res.cookie('refresh_token', token.refreshToken, {
      maxAge: Date.now() + 7 * 24 * 60 * 60,
      httpOnly: true,
    });

    const instance = new AuthResponse();
    instance.token = token.token;
    instance.name = user.name;
    instance.username = user.username;
    instance.expiry = token.expiry;

    return instance;
  }

  @Query(() => AuthResponse)
  async refresh(
    @Arg('token') token: string,
    @Ctx() ctx: Context
  ): Promise<AuthResponse> {
    const refreshToken = ctx.req.cookies['refresh_token'];
    let data: DecodedToken | undefined;

    try {
      data = Auth.decodeToken(token);
    } catch (err) {
      data = Auth.decodeToken(refreshToken);
    } finally {
      if (typeof data === 'undefined') {
        throw new Error('Session timeout');
      }
    }

    const response = Auth.generateToken(data);
    if (data.exp - Date.now() < 60 * 60) {
      // if less time is available use the new refresh token
      ctx.res.cookie('refresh_token', response.refreshToken, {
        maxAge: Date.now() + 7 * 24 * 60 * 60,
        httpOnly: true,
      });
    }

    const instance = new AuthResponse();
    instance.token = response.token;
    instance.expiry = response.expiry;
    instance.name = data.name;
    instance.username = data.username;
    instance.expiry = response.expiry;

    return instance;
  }

  @Query(() => AuthResponse)
  async login(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() ctx: Context
  ): Promise<AuthResponse> {
    const user = await User.findOne({ username });
    let match;
    if (user) {
      match = await bcrypt.compare(password, user.password);
    }

    if (!(match && user)) {
      throw new Error('Invalid username/password');
    }

    const token = Auth.generateToken({
      username: user.username,
      email: user.email,
      name: user.name,
    });

    ctx.res.cookie('refresh_token', token.refreshToken, {
      maxAge: Date.now() + 7 * 24 * 60 * 60,
      httpOnly: true,
    });

    const instance = new AuthResponse();
    instance.token = token.token;
    instance.name = user.name;
    instance.username = user.username;
    instance.expiry = token.expiry;

    return instance;
  }
}
