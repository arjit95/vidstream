import { ObjectType, Field, Int } from 'type-graphql';
import { Channel } from '@me/common/db/models/Channel';
import { Video } from '@me/common/db/models/Video';

@ObjectType()
class BaseType {
  @Field(() => Int)
  total!: number;
}

@ObjectType()
export class Channels extends BaseType {
  @Field(() => [Channel])
  result!: Array<Channel>;
}

@ObjectType()
export class Videos extends BaseType {
  @Field(() => [Video])
  result!: Array<Video>;
}
