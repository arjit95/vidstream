import { Entity, Column, ManyToOne, JoinColumn, BaseEntity, PrimaryColumn } from 'typeorm';
import {ObjectType, Field, Int} from 'type-graphql';

import { Video } from './Video';

@Entity({ name: 'trending' })
@ObjectType()
export class Trending extends BaseEntity {
  @PrimaryColumn({type: 'bigint', generated: process.env.CONFIG_ENABLE_SHARDING !== '1'})
  id!: string;

  @Column('bigint')
  @Field(() => Int)
  views!: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  @Field()
  timestamp!: Date;

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
}
