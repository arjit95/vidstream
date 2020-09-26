import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Authorized,
  UnauthorizedError,
} from 'type-graphql';
import { SearchResponse } from '../types/output';
import { PaginatedInput } from '../types/input';
import { Context } from '../context';
import { Aggregator } from '../search/Aggregator';
import { Videos } from '../types/output';
import { Related } from '../search/Related';
import { VideoRecommender } from '../search/VideoRecommender';

@Resolver(SearchResponse)
export class SearchResolver {
  @Query(() => SearchResponse)
  async search(
    @Arg('query') query: string,
    @Arg('pagination', () => PaginatedInput, {
      nullable: true,
      defaultValue: { skip: 0, take: 50 },
    })
    pagination: PaginatedInput,
    @Ctx() ctx: Context
  ): Promise<SearchResponse> {
    return Aggregator.search(query, ctx.metrics, pagination);
  }

  @Query(() => Videos)
  async getRelatedVideos(
    @Arg('id') videoId: string,
    @Arg('pagination', () => PaginatedInput, {
      nullable: true,
      defaultValue: { skip: 0, take: 50 },
    })
    pagination: PaginatedInput,
    @Ctx() ctx: Context
  ): Promise<Videos> {
    const videos = await VideoRecommender.getSimilarVideos(
      videoId,
      ctx.metrics,
      pagination.take,
      pagination.skip
    );
    if (videos.result.length) {
      return videos;
    }

    return Related.getRelatedVideos(videoId, pagination, ctx.metrics);
  }

  @Authorized()
  @Query(() => Videos)
  async getUserRecommendations(
    @Arg('pagination', () => PaginatedInput, {
      nullable: true,
      defaultValue: { skip: 0, take: 50 },
    })
    pagination: PaginatedInput,
    @Ctx() ctx: Context
  ): Promise<Videos> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    return VideoRecommender.getUserRecommendations(
      ctx.user.username,
      ctx.metrics,
      pagination.take,
      pagination.skip
    );
  }
}
