import { ObjectType, Field, Int } from 'type-graphql';
import { Video } from '@me/common/db/models/Video';

@ObjectType()
export class SearchResult {
  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field()
  id!: string;
}

@ObjectType()
export class SearchSuggestion {
  @Field()
  query!: string;
}

@ObjectType()
export class SearchResponse {
  @Field(() => [SearchResult])
  results!: Array<SearchResult>;

  @Field(() => SearchSuggestion, { nullable: true })
  suggestion?: SearchSuggestion;
}

@ObjectType()
class BaseType {
  @Field(() => Int, { defaultValue: 0 })
  total!: number;
}

@ObjectType()
export class Videos extends BaseType {
  @Field(() => [Video])
  result!: Array<Video>;
}

@ObjectType()
export class EmptyResponse {
  @Field(() => Int)
  status!: number;
}
