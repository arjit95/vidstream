import {
  Mutation,
  Resolver,
  Ctx,
  Arg,
  Authorized,
  UnauthorizedError,
  Query,
} from 'type-graphql';
import { In } from 'typeorm';
import { Comment } from '@me/common/db/models/Comment';
import { Video } from '@me/common/db/models/Video';
import { CommentLike } from '@me/common/db/models/CommentLike';
import { User } from '@me/common/db/models/User';
import { IdGen } from '@me/common/utils/IdGen';
import { Context } from '../context';
import { Comments, PaginatedInput, LikeType } from '../types';

@Resolver(Comment)
export class CommentResolver {
  @Authorized()
  @Mutation(() => Comment)
  async addComment(
    @Arg('video_id') id: string,
    @Arg('content') content: string,
    @Arg('parent', { nullable: true }) parent: string,
    @Ctx() ctx: Context
  ): Promise<Comment> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const video = await Video.findOneOrFail({
      where: {
        id: id,
        user: {
          username: IdGen.decode(id).split('-')[0],
        },
      },
    });

    const user = await User.findOneOrFail({
      where: {
        username: ctx.user.username,
      },
    });

    const comment = new Comment();
    comment.content = content;
    comment.likes = 0;
    comment.dislikes = 0;
    comment.user = user;
    comment.video = video;

    await comment.save();

    return comment;
  }

  @Authorized()
  @Mutation(() => Boolean, { nullable: true })
  async removeComment(
    @Arg('comment_id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const comment = await Comment.findOneOrFail({
      where: {
        id,
        user: {
          username: IdGen.decode(id).split('-')[0],
        },
      },
    });

    await comment.remove();
    return true;
  }

  @Query(() => Comments)
  async getComments(
    @Arg('pagination', () => PaginatedInput, {
      nullable: true,
      defaultValue: { skip: 0, take: 50 },
    })
    pagination: PaginatedInput,
    @Arg('video_id') video_id: string,
    @Ctx() ctx: Context,
    @Arg('parent_id', { nullable: true }) parent?: string
  ): Promise<Comments> {
    const [comments, total] = await Comment.findAndCount({
      where: {
        parent: {
          id: parent,
        },
        video: {
          id: video_id,
        },
      },
      order: { created_at: 'DESC' },
      skip: pagination.skip,
      take: pagination.take,
    });

    const response = new Comments();
    response.result = comments;
    response.total = total;

    if (!ctx.user) {
      response.result = response.result.map(comment => {
        comment.liked = LikeType.Unliked;
        return comment;
      });

      return response;
    }

    const ids = response.result.map(({ id }) => id);
    const likes = await CommentLike.find({
      where: {
        comment: {
          id: In(ids),
        },
        user: {
          username: ctx.user.username,
        },
      },
    });

    const likesMap = likes.reduce((acc: { [key: string]: LikeType }, like) => {
      acc[like.comment.id] = like.liked;
      return acc;
    }, {});

    response.result = response.result.map(comment => {
      comment.liked = likesMap[comment.id] ?? LikeType.Unliked;
      return comment;
    });

    return response;
  }
}
