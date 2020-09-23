import { Client } from '@elastic/elasticsearch';
import { Model } from './Model';
import { VideoSchema as Schema } from '../schema/Video';

export type VideoCreate = {
  title: string;
  categories: Array<string>;
  userID: string;
  id: string;
  description?: string;
  channelId: string;
};

/**
 * Allows to manage Videos index in elasticsearch database
 * @class
 * @classdesc Manages videos index in elasticsearch
 */
export class Videos extends Model {
  constructor(client: Client) {
    super(client);
    this.index = 'videos';
    this.schema = Schema;
  }

  /**
   * Creates a new video in the index
   **/
  async create(videoInfo: VideoCreate) {
    const response = await this.client.create({
      index: this.index,
      id: videoInfo.id,
      body: {
        title: videoInfo.title,
        categories: videoInfo.categories,
        username: videoInfo.userID,
        description: videoInfo.description,
        channel_id: videoInfo.channelId,
      },
    });

    this._throwErrorIfFailed(response);
    const metadata = response.body;
    return { metadata, response: null };
  }
}
