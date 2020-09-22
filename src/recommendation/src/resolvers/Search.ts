import { Resolver, Query, Arg, Ctx } from 'type-graphql';
import { SearchResponse } from '../types/output';
import { PaginatedInput } from '../types/input';
import { Context } from '../context';
import { Aggregator } from '../search/Aggregator';
import { Videos } from '../types/output';
import { Related } from '../search/Related';

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
    return Related.getRelatedVideos(videoId, pagination, ctx.metrics);
  }
}
