import { Resolver, Query, Arg, Ctx } from 'type-graphql';
import { Video } from '@me/common/db/models/Video';
import { Trending } from '@me/common/db/models/Trending';
import { IdGen } from '@me/common/utils/IdGen';
import { Videos, VideoMeta, LikeType, PaginatedInput } from '../types';
import { Context } from '../context';
import { VideoLike } from '@me/common/db/models/VideoLike';
import { Subscription } from '@me/common/db/models/Subscription';

@Resolver(Video)
export class VideoResolver {
  @Query(() => VideoMeta)
  async video(@Arg('id') id: string, @Ctx() ctx: Context): Promise<VideoMeta> {
    const username = IdGen.decode(id).split('-')[0];
    const video = (await Video.findOneOrFail({
      id,
      user: { username },
    })) as VideoMeta;
    if (!ctx.user) {
      video.liked = LikeType.Unliked;
    } else {
      const like = await VideoLike.findOne({
        where: {
          video: {
            id,
          },
          user: {
            username: ctx.user.username,
          },
        },
      });

      video.liked = like ? like.liked : LikeType.Unliked;
      video.channel.subscribed = !!(await Subscription.findOne({
        where: {
          user: {
            username: ctx.user.username,
          },
          channel: {
            id: video.channel.id,
          },
        },
      }));
    }

    return video;
  }

  @Query(() => Videos)
  async videos(
    @Arg('pagination', () => PaginatedInput, {
      nullable: true,
      defaultValue: { skip: 0, take: 50 },
    })
    pagination: PaginatedInput,
    @Arg('channel_id', { nullable: true }) channelId?: string,
    @Arg('username', { nullable: true }) username?: string
  ): Promise<Videos> {
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
      take: pagination.take,
      skip: pagination.skip,
    });

    const response = new Videos();
    response.result = videos;
    response.total = total;

    return response;
  }

  @Query(() => Videos)
  async recentVideos(
    @Arg('pagination', () => PaginatedInput, {
      nullable: true,
      defaultValue: { skip: 0, take: 50 },
    })
    pagination: PaginatedInput
  ): Promise<Videos> {
    const [videos, total] = await Video.findAndCount({
      order: {
        uploaded_at: 'DESC',
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const response = new Videos();
    response.result = videos;
    response.total = total;

    return response;
  }

  @Query(() => Videos)
  async trending(
    @Arg('pagination', () => PaginatedInput, {
      nullable: true,
      defaultValue: { skip: 0, take: 50 },
    })
    pagination: PaginatedInput
  ): Promise<Videos> {
    const [trending, total] = await Trending.findAndCount({
      order: {
        timestamp: 'DESC',
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const response = new Videos();
    response.result = trending.map(({ video }) => video);
    response.total = total;

    return response;
  }
}
