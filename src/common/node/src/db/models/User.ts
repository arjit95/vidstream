import { Column, PrimaryColumn, Entity, BaseEntity, Index } from 'typeorm';
import {ObjectType, Field, Int} from 'type-graphql';

@Entity({ name: 'users' })
@ObjectType()
export class User extends BaseEntity {
  @Index('user_index')
  @PrimaryColumn('varchar', { length: 24, nullable: false })
  @Field()
  username!: string;

  @Column('varchar', { length: 150, nullable: false })
  @Field()
  name!: string;

  @Column('varchar', { length: 128, nullable: false })
  password!: string;

  @Column('varchar', { length: 50, nullable: false })
  @Field()
  email!: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  joined?: Date;

  @Column('text', {nullable: true})
  @Field()
  description?: string;

  @Column('smallint', { default: () => 1, nullable: false })
  @Field(() => Int)
  channel_count!: number;
}