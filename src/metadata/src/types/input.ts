import { InputType, Field, Int } from 'type-graphql';
import { Max, Min } from 'class-validator';

@InputType()
export class PaginatedInput {
  @Field(() => Int)
  @Min(1)
  @Max(50)
  take!: number;

  @Field(() => Int)
  @Min(0)
  skip!: number;
}

@InputType()
export class EditUserInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class EditChannelInput {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class CreateChannelInput {
  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;
}
