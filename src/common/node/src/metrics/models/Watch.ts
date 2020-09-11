import { Client } from '@elastic/elasticsearch';
import Model from './Model';
import { IdGen } from '../../utils';
import { VideoCreate } from './Videos';
import { WatchSchema as Schema } from '../schema/Watch';

/**
 * Allows to manage Watch index in elasticsearch database
 * @class
 * @classdesc Manages watch index in elasticsearch
 */
export class Watch extends Model {
  static itemType = '09';

  constructor(client: Client) {
    super(client);
    this.index = 'watch';
    this.schema = Schema;
  }

  async create(videoInfo: VideoCreate) {
    const id = IdGen.encode(
      `${videoInfo.userID}-${Watch.itemType}-${Date.now()}`
    );

    const response = await this.client.create({
      index: this.index,
      id,
      body: {
        title: videoInfo.title,
        genres: videoInfo.genres,
        user_id: videoInfo.userID,
      },
    });

    this._throwErrorIfFailed(response);
    const { metadata, ..._source } = response.body;
    return { metadata, response: _source };
  }
}
