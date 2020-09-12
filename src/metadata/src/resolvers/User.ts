import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Authorized,
  Ctx,
  UnauthorizedError,
} from 'type-graphql';
import { User } from '@me/common/db/models/User';
import { EditUserInput } from '../types';
import { Context } from '../context';

@Resolver(User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  user(@Arg('username') username: string): Promise<User> {
    return User.findOneOrFail({ username });
  }

  @Authorized()
  @Mutation(() => User)
  async editUser(
    @Arg('user') user: EditUserInput,
    @Ctx() ctx: Context
  ): Promise<User> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const existing = await User.findOneOrFail({
      where: {
        username: ctx.user.username,
      },
    });

    existing.name = user.name;
    existing.description = user.description;
    existing.save();

    return existing;
  }
}
