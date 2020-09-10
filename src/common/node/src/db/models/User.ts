import { Column, PrimaryColumn, Entity, BaseEntity, Index } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

@Entity({ name: 'users' })
@ObjectType()
export class User extends BaseEntity {
  @Index('user_index')
  @PrimaryColumn('varchar', { length: 14, nullable: false })
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

  @Column('text', { nullable: true })
  @Field()
  description?: string;

  static itemType = '01';
}
