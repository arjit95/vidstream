import {
  Mutation,
  Resolver,
  Ctx,
  Arg,
  Authorized,
  UnauthorizedError,
  Query,
} from 'type-graphql';
import { Subscription } from '@me/common/db/models/Subscription';
import { Context } from '../context';
import { User, Channel } from '@me/common/db/models';
import { IdGen } from '@me/common/utils/IdGen';
import { getManager } from 'typeorm';
import { PaginatedInput, Subscriptions } from '..//types';

@Resolver(Subscription)
export class SubscriptionResolver {
  @Authorized()
  @Query(() => Subscriptions)
  async getSubscriptions(
    @Arg('pagination', { nullable: true, defaultValue: { skip: 0, take: 50 } })
    pagination: PaginatedInput,
    @Ctx() ctx: Context
  ): Promise<Subscriptions> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const [subscriptions, total] = await Subscription.findAndCount({
      where: {
        user: {
          username: ctx.user.username,
        },
      },
      order: {
        timestamp: 'DESC',
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const response = new Subscriptions();
    response.result = subscriptions;
    response.total = total;

    return response;
  }

  @Authorized()
  @Mutation(() => Subscription)
  async addSubscription(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<Subscription> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const username = ctx.user.username;
    const existing = await Subscription.findOne({
      where: {
        user: {
          username,
        },
        channel: {
          id,
        },
      },
    });

    if (existing) {
      throw new Error('Subscription already exists');
    }

    const user = await User.findOneOrFail({
      where: {
        username,
      },
    });

    const channel = await Channel.findOneOrFail({
      where: {
        id,
        user: {
          username: IdGen.decode(id).split('-')[0],
        },
      },
    });

    const sub = new Subscription();
    sub.user = user;
    sub.id = IdGen.encode(
      `${user.username}-${Subscription.itemType}-${Date.now()}`
    );
    sub.channel = channel;

    channel.subscribers++;

    await getManager().transaction(async transactionManager => {
      await transactionManager.save(sub);
      await transactionManager.save(channel);
    });

    return sub;
  }

  @Authorized()
  @Mutation(() => Boolean, { nullable: true })
  async removeSubscription(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const username = ctx.user.username;
    const subscription = await Subscription.findOneOrFail({
      where: {
        user: {
          username,
        },
        channel: {
          id,
        },
      },
    });

    const channel = await Channel.findOneOrFail({
      where: {
        id,
        user: {
          username: IdGen.decode(id).split('-')[0],
        },
      },
    });

    channel.subscribers--;

    await getManager().transaction(async transactionManager => {
      transactionManager.save(channel);
      transactionManager.remove(subscription);
    });

    return true;
  }
}
