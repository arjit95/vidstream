import { PrimaryColumn, Column, ManyToOne, Entity, JoinColumn, BaseEntity } from 'typeorm';
import {ObjectType, Field } from 'type-graphql';

import { User } from './User';
import { Comment } from './Comment';

@Entity({ name: 'comment_likes' })
@ObjectType()
export class CommentLike extends BaseEntity {
  @PrimaryColumn({type: 'bigint', generated: process.env.CONFIG_ENABLE_SHARDING !== '1'})
  id!: number;

  @ManyToOne(
    () => User,
    {
      onDelete: 'CASCADE',
      eager: true,
      nullable: false
    }
  )
  @JoinColumn({name: 'username'})
  @Field(() => User)
  user!: User;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  timestamp?: Date;

  @ManyToOne(
    () => Comment,
    {
      onDelete: 'CASCADE',
      eager: true,
      nullable: false
    }
  )
  @JoinColumn({name: 'comment_id'})
  @Field(() => Comment)
  comment!: Comment;

  @Column('tinyint', { default: () => 1, nullable: false })
  @Field()
  liked?: number;
}
