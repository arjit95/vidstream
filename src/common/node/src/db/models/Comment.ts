import {
  Entity,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  BaseEntity,
  PrimaryColumn,
} from 'typeorm';
import { Field, ObjectType, Int } from 'type-graphql';

import { User } from './User';
import { Video } from './Video';

@Entity({ name: 'comments' })
@ObjectType()
export class Comment extends BaseEntity {
  @PrimaryColumn('varchar', { length: 36, nullable: false })
  @Field()
  id!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'username' })
  @Field(() => User)
  user!: User;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', nullable: false })
  @Field()
  created_at!: Date;

  @Column('text', { nullable: false })
  @Field()
  content!: string;

  @Index('comment_video_id_pk')
  @ManyToOne(() => Video, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'video_id' })
  @Field(() => Video)
  video!: Video;

  @ManyToOne(() => Comment, (comment) => comment.id, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @JoinColumn({name: 'parent_id'})
  @Field({ nullable: true })
  parent?: Comment;

  @Column('integer', { default: () => 0, nullable: false })
  @Field(() => Int, { nullable: true })
  likes!: number;

  @Column('integer', { default: () => 0, nullable: false })
  @Field(() => Int, { nullable: false })
  dislikes!: number;

  static itemType = '04';
  static relations = ['id', 'user', 'user.username', 'video', 'video.id', 'parent', 'parent.id', 'likes', 'dislikes']
}
