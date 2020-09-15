import {
  Resolver,
  Query,
  Arg,
  Ctx,
  Mutation,
  Authorized,
  UnauthorizedError,
} from 'type-graphql';
import { Channel } from '@me/common/db/models/Channel';
import { User } from '@me/common/db/models/User';

import { IdGen } from '@me/common/utils/IdGen';

import {
  Channels,
  EditChannelInput,
  PaginatedInput,
  CreateChannelInput,
  DeleteChannelInput,
} from '../types';
import { Context } from '../context';

@Resolver(Channel)
export class ChannelResolver {
  @Query(() => Channels, { nullable: true })
  async channels(
    @Arg('pagination', () => PaginatedInput, {
      nullable: true,
      defaultValue: { skip: 0, take: 50 },
    })
    pagination: PaginatedInput,
    @Arg('username') username: string
  ): Promise<Channels> {
    const [channels, total] = await Channel.findAndCount({
      where: {
        user: {
          username,
        },
      },
      take: pagination.take,
      skip: pagination.skip,
    });

    const response = new Channels();
    response.result = channels;
    response.total = total;

    return response;
  }

  @Query(() => Channel)
  channel(@Arg('id') id: string): Promise<Channel | undefined> {
    const username = IdGen.decode(id).split('-')[0];
    return Channel.findOne({
      where: {
        id,
        user: {
          username,
        },
      },
    });
  }

  @Authorized()
  @Mutation(() => Channel)
  async createChannel(
    @Arg('channel') input: CreateChannelInput,
    @Ctx() ctx: Context
  ): Promise<Channel> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const user = await User.findOneOrFail({
      where: {
        username: ctx.user.username,
      },
    });

    const channel = new Channel();
    channel.user = user;
    channel.title = input.title;
    channel.description = input.description;

    channel.id = IdGen.encode(
      `${user.username}-${Channel.itemType}-${Date.now()}`
    );

    await ctx.metrics.Channels.create({
      id: channel.id,
      title: channel.title,
      description: channel.description,
      userID: user.username,
    });

    await channel.save();

    return channel;
  }

  @Authorized()
  @Mutation(() => Channel)
  async deleteChannel(
    @Arg('channel') input: DeleteChannelInput,
    @Ctx() ctx: Context
  ): Promise<Channel> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const channel = await Channel.findOneOrFail({
      where: {
        id: input.id,
        user: {
          username: ctx.user.username,
        },
      },
    });

    await ctx.metrics.Channels.delete(channel.id);
    await channel.remove();

    return channel;
  }

  @Authorized()
  @Mutation(() => Channel)
  async editChannel(
    @Arg('channel') input: EditChannelInput,
    @Ctx() ctx: Context
  ): Promise<Channel> {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    const channel = await Channel.findOneOrFail({
      where: {
        id: input.id,
        user: {
          username: ctx.user.username,
        },
      },
    });

    channel.description = input.description;
    channel.title = input.title ?? channel.title;

    await ctx.metrics.Channels.edit(channel.id, {
      title: channel.title,
      description: channel.description,
    });

    await channel.save();
    return channel;
  }
}
