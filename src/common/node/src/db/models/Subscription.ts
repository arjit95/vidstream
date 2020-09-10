import {
  PrimaryColumn,
  Column,
  ManyToOne,
  Entity,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

import { Channel } from './Channel';
import { User } from './User';

@Entity({ name: 'subscriptions' })
@ObjectType()
export class Subscription extends BaseEntity {
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

  @ManyToOne(() => Channel, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'channel_id' })
  @Field(() => Channel)
  channel!: Channel;

  static itemType = '06';
}
