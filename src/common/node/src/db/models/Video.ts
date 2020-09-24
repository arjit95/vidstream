import {
  PrimaryColumn,
  Column,
  ManyToOne,
  Index,
  Entity,
  JoinColumn,
  BaseEntity,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';

import { Channel } from './Channel';
import { User } from './User';

@Entity({ name: 'videos' })
@ObjectType()
export class Video extends BaseEntity {
  @Index('video_pk')
  @PrimaryColumn('varchar', { length: 36, nullable: false })
  @Field()
  id!: string;

  @Column('varchar', { length: 128, nullable: false })
  @Field()
  title!: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  description?: string;

  @ManyToOne(() => Channel, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'channel_id' })
  @Field(() => Channel, { nullable: false })
  channel!: Channel;

  @ManyToOne(
    () => User,
    user => user.username,
    {
      onDelete: 'CASCADE',
      eager: true,
      nullable: false,
    }
  )
  @JoinColumn({ name: 'username' })
  @Field(() => User)
  user!: User;

  @CreateDateColumn({ type: 'timestamp' })
  @Field()
  uploaded_at?: Date;

  @Column('smallint', { nullable: false })
  listing!: number;

  @Column('json', { nullable: true })
  @Field(() => [String])
  tags?: Array<string>;

  @Column('json', { nullable: true })
  @Field(() => [String])
  categories?: string[];

  @Column('integer', { default: () => 0, nullable: false })
  @Field(() => Int)
  likes!: number;

  @Column('integer', { default: () => 0, nullable: false })
  @Field(() => Int)
  dislikes!: number;

  @Column('integer', { default: () => 0, nullable: false })
  @Field(() => Int)
  views!: number;

  @Column('tinyint', { default: () => 1, nullable: false })
  @Field(() => Int)
  uploading!: number;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  static itemType = '03';
}
