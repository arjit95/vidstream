import {
  PrimaryColumn,
  Column,
  ManyToOne,
  Entity,
  JoinColumn,
  BaseEntity,
  SelectQueryBuilder,
  FindConditions,
  ObjectLiteral,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

import { User } from './User';
import { Comment } from './Comment';

@Entity({ name: 'comment_likes' })
@ObjectType()
export class CommentLike extends BaseEntity {
  @PrimaryColumn('varchar', { length: 36, nullable: false })
  id!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'username' })
  @Field(() => User)
  user!: User;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  timestamp?: Date;

  @ManyToOne(() => Comment, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'comment_id' })
  @Field(() => Comment)
  comment!: Comment;

  @Column('tinyint', { default: () => 1, nullable: false })
  @Field()
  liked!: number;

  static itemType = '05';

  static getQuery(
    where: FindConditions<CommentLike> | ObjectLiteral,
    take?: number,
    skip?: number
  ): SelectQueryBuilder<CommentLike> {
    let query = CommentLike.getRepository().createQueryBuilder('t1');
    if (skip) {
      query = query.skip(skip);
    }

    if (take) {
      query = query.take(take);
    }

    return query
      .leftJoinAndMapOne('t1.user', User, 't2', 't1.username = t2.username')
      .leftJoinAndMapOne('t1.comment', Comment, 't3', 't1.comment_id = t3.id')
      .where(where);
  }
}
