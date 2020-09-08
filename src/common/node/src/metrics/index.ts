import { getInstance } from './adapter';

import { Users, Videos, Watch } from './models';
import Model from './models/Model';
import { Client } from '@elastic/elasticsearch';

export type ElasticObj = {
  Users: Users;
  Videos: Videos;
  Watch: Watch;
}

async function createIndex(instance: Model, client: Client): Promise<void> {
  const response = await client.indices.exists({
    index: instance.index,
  });

  if (response.statusCode === 200) {
    return;
  }

  await client.indices.create({
    index: instance.index,
    body: instance.schema,
  });
}

let dbObj: ElasticObj;

export class Metrics {
  static async getInstance(): Promise<ElasticObj> {
    if (dbObj) {
      return dbObj;
    }

    const client = await getInstance();
    dbObj = {
      Users: new Users(client),
      Videos: new Videos(client),
      Watch: new Watch(client),
    };

    await createIndex(dbObj.Users, client);
    await createIndex(dbObj.Videos, client);
    await createIndex(dbObj.Watch, client);

    return dbObj;
  }
}
