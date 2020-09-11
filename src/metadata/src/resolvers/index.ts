import { Resolver, Query, Arg, Int } from 'type-graphql';
import { User, Video, Channel } from '@me/common/db/models';
import { IdGen } from '@me/common/utils/IdGen';
import { Channels, Videos } from '../types';

@Resolver(User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  user(@Arg('username') username: string): Promise<User | undefined> {
    return User.findOne({ username });
  }
}

@Resolver(Channel)
export class ChannelResolver {
  @Query(() => Channels, { nullable: true })
  async channels(
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
    @Arg('skip', () => Int, { defaultValue: 0 }) skip: number,
    @Arg('username') username: string
  ): Promise<Channels> {
    limit = Math.max(50, limit);
    const [channels, total] = await Channel.findAndCount({
      where: {
        user: {
          username,
        },
      },
      take: limit,
      skip: skip,
    });

    const response = new Channels();
    response.result = channels;
    response.total = total;

    return response;
  }

  @Query(() => Channel)
  channel(@Arg('id') id: string): Promise<Channel | undefined> {
    const username = IdGen.decode(id).split('-')[0];
    return Channel.findOne({
      where: {
        id,
        user: {
          username,
        },
      },
    });
  }
}

@Resolver(Video)
export class VideoResolver {
  @Query(() => Video, { nullable: true })
  video(@Arg('id') id: string): Promise<Video | undefined> {
    const username = IdGen.decode(id).split('-')[0];
    return Video.findOne({ id, user: { username } });
  }

  @Query(() => Videos, { nullable: true })
  async videos(
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
    @Arg('skip', () => Int, { defaultValue: 0 }) skip: number,
    @Arg('channelId', { nullable: true }) channelId?: string,
    @Arg('username', { nullable: true }) username?: string
  ): Promise<Videos> {
    limit = Math.max(50, limit);

    if (!(username || channelId)) {
      throw new Error('Please supply channel or username');
    }

    if (channelId && !username) {
      username = IdGen.decode(channelId).split('-')[0];
    }

    let query: { user: { username?: string }; channel?: { id: string } } = {
      user: {
        username,
      },
    };

    if (channelId) {
      query.channel = { id: channelId };
    }

    const [videos, total] = await Video.findAndCount({
      where: query,
      take: limit,
      skip: skip,
    });

    const response = new Videos();
    response.result = videos;
    response.total = total;

    return response;
  }
}
