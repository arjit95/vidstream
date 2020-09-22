import { Client } from '@elastic/elasticsearch';
import { Model, Field } from './Model';
import { ChannelSchema as Schema } from '../schema/Channel';

export interface ChannelCreate {
  title: string;
  userID: string;
  id: string;
  description?: string;
}

/**
 * Allows to manage Videos index in elasticsearch database
 * @class
 * @classdesc Manages videos index in elasticsearch
 */
export class Channels extends Model {
  constructor(client: Client) {
    super(client);
    this.index = 'channels';
    this.schema = Schema;
  }

  /**
   * Creates a new video in the index
   **/
  async create(channelInfo: ChannelCreate) {
    const response = await this.client.create({
      index: this.index,
      id: channelInfo.id,
      body: {
        title: channelInfo.title,
        username: channelInfo.userID,
        description: channelInfo.description,
      },
    });

    this._throwErrorIfFailed(response);
    const metadata = response.body;
    return { metadata, response: null };
  }
}
