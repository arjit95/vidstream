import { Client } from '@elastic/elasticsearch';
import { Model } from './Model';
import { UserSchema as Schema } from '../schema/User';

export type UserCreate = {
  name: string;
  username: string;
  id: string;
};

/**
 * Allows to manage User index in elasticsearch database
 * @class
 * @classdesc Manages users index in elasticsearch
 */
export class Users extends Model {
  constructor(client: Client) {
    super(client);

    this.index = 'users';
    this.schema = Schema;
  }

  /**
   * Creates a new user in the index
   **/
  async create(userInfo: UserCreate) {
    const response = await this.client.create({
      index: this.index,
      id: userInfo.id,
      body: {
        username: userInfo.username,
        name: userInfo.name,
      },
    });

    this._throwErrorIfFailed(response);
    const metadata = response.body;
    return { metadata, response: null };
  }
}
