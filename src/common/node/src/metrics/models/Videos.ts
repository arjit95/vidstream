import { Client } from '@elastic/elasticsearch';
import { Model, Field } from './Model';
import { VideoSchema as Schema } from '../schema/Video';

export interface VideoCreate {
  title: string;
  genres: Array<string>;
  userID: string;
  id: string;
  description?: string;
  channelId: string;
}

/**
 * Allows to manage Videos index in elasticsearch database
 * @class
 * @classdesc Manages videos index in elasticsearch
 */
export class Videos extends Model {
  static fieldsToSearch: Field[] = [
    {
      name: 'title.raw',
      boost: 1.0,
    },
    {
      name: 'genres.raw',
      boost: 0.4,
    },
    {
      name: 'description',
      boost: 0.2,
    },
  ];

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
