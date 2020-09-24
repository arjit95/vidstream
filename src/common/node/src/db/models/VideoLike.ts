import {
  PrimaryColumn,
  Column,
  ManyToOne,
  Entity,
  JoinColumn,
  BaseEntity,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

import { User } from './User';
import { Video } from './Video';

@Entity({ name: 'video_likes' })
@ObjectType()
export class VideoLike extends BaseEntity {
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

  @CreateDateColumn({ type: 'timestamp' })
  timestamp?: Date;

  @ManyToOne(() => Video, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'video_id' })
  @Field(() => Video)
  video!: Video;

  @Column('tinyint', { default: () => 1, nullable: false })
  @Field()
  liked!: number;

  static itemType = '07';
}
