import { Client } from '@elastic/elasticsearch';
import Model from './Model';
import {VideoSchema as Schema} from '../schema/Video';

export interface VideoCreate {
  title: string;
  genres: Array<string>;
  userID: string;
  id: string;
}

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
        genres: videoInfo.genres,
        user_id: videoInfo.userID,
      },
    });

    this._throwErrorIfFailed(response);
    const metadata = response.body;
    return { metadata, response: null };
  }
}

module.exports = Videos;
