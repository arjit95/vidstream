import { Mutation, Arg, Resolver, Ctx, Float } from 'type-graphql';
import { EmptyResponse } from '../types/output';
import { Context } from '../context';
import { Video } from '@me/common/db/models/Video';
import { IdGen } from '@me/common/utils/IdGen';
import { Watch } from '@me/common/metrics/models/Watch';

@Resolver()
export class Recommendation {
  @Mutation(() => EmptyResponse)
  async addRecommendation(
    @Arg('id') videoId: string,
    @Arg('duration', () => Float) duration: number,
    @Ctx() ctx: Context
  ): Promise<EmptyResponse> {
    let idParts = [Watch.itemType, videoId];
    let username: string | null = null;

    if (ctx.user) {
      idParts.unshift(ctx.user.username);
      username = ctx.user.username;
    }

    idParts.unshift(Date.now().toString());

    await Video.findOneOrFail({ id: videoId });
    const payload = {
      username,
      video_id: videoId,
      id: IdGen.encode(idParts.join('-')),
      duration,
    };

    ctx.logger.emit('watch', { ...payload });

    const response = new EmptyResponse();
    response.status = 200;
    return response;
  }
}
