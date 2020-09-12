import { ObjectType, Field, Int } from 'type-graphql';
import { Channel } from '@me/common/db/models/Channel';
import { Video } from '@me/common/db/models/Video';
import { Comment, Subscription } from '@me/common/db/models';
import { LikeType } from './enum';

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

@ObjectType()
export class VideoMeta extends Video {
  @Field()
  liked?: LikeType;
}

@ObjectType()
class CommentMeta extends Comment {
  @Field()
  liked?: LikeType;
}

@ObjectType()
export class Comments extends BaseType {
  @Field(() => [CommentMeta])
  result!: Array<CommentMeta>;
}

@ObjectType()
export class Subscriptions extends BaseType {
  @Field(() => [Subscription])
  result!: Array<Subscription>;
}
