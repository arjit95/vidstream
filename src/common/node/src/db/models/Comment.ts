import {
  Entity,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  BaseEntity,
  PrimaryColumn,
} from 'typeorm';
import {Field, ObjectType, ID, Int} from 'type-graphql';

import { User } from './User';
import { Video } from './Video';

@Entity({ name: 'comments' })
@ObjectType()
export class Comment extends BaseEntity {
  @PrimaryColumn({type: 'bigint', generated: process.env.CONFIG_ENABLE_SHARDING !== '1'})
  @Field(() => ID)
  readonly id!: number;

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

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', nullable: false })
  @Field()
  created_at!: Date;

  @Column('text', { nullable: false })
  @Field()
  content!: string;

  @Index('comment_video_id_pk')
  @ManyToOne(
    () => Video,
    {
      onDelete: 'CASCADE',
      eager: true,
      nullable: false
    }
  )
  @JoinColumn({name: 'video_id'})
  @Field(() => Video)
  video!: Video;

  @ManyToOne(
    () => Comment,
    {
      onDelete: 'CASCADE',
      eager: true,
      nullable: true
    }
  )
  @JoinColumn({name: 'parent_id'})
  @Field(() => Comment, {nullable: true})
  parent?: Comment;

  @Column('integer', { default: () => 0, nullable: false })
  @Field(() => Int, {nullable: true})
  likes!: number;

  @Column('integer', { default: () => 0, nullable: false })
  @Field(() => Int, {nullable: false})
  dislikes!: number;
}
