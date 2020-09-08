import { Resolver, Query, Arg, Int } from 'type-graphql';
import { User, Video, Channel } from '@me/common/db/models';
import { Common } from '@me/common/utils/common';
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
}

@Resolver(Video)
export class VideoResolver {
  @Query(() => Video, { nullable: true })
  video(@Arg('id') id: string): Promise<Video | undefined> {
    const [username] = Common.decodeUniqueId(id).split(':');
    return Video.findOne({ id, user: { username } });
  }

  @Query(() => Videos, { nullable: true })
  async videos(
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
    @Arg('skip', () => Int, { defaultValue: 0 }) skip: number,
    @Arg('username', { defaultValue: '' }) username: string,
    @Arg('channelId', { defaultValue: '' }) channelId: string
  ): Promise<Videos> {
    limit = Math.max(50, limit);

    if (!(channelId && username)) {
      throw new Error('Please supply username or channel id');
    }

    username = username || Common.decodeUniqueId(channelId).split(':')[0];

    const query = username
      ? { user: { username } }
      : { channel: { id: channelId } };

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
