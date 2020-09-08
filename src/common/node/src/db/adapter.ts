import { Connection, createConnection } from 'typeorm';
import {SnakeNamingStrategy} from 'typeorm-naming-strategies';
import * as Models from './models';

export class Adapter {
  private static connection: Connection;

  private static async shouldCreateTables(schemas: Function[]): Promise<boolean> {    
    const tables = schemas.map(schema => Adapter.connection.getMetadata(schema).tableName);
    const queryRunner = Adapter.connection.createQueryRunner();
    const exists = await Promise.all(tables.map(table => queryRunner.hasTable(table)));
    const shouldCreate = !exists.every(exist => exist); // Skip if all table exists

    return shouldCreate;
  }

  static async createConnection(): Promise<void> {
    if (Adapter.connection) {
      return
    }

    const entities = [
      Models.User,
      Models.Channel,
      Models.Video,
      Models.VideoLike,
      Models.Comment,
      Models.CommentLike,
      Models.Subscription,
      Models.Trending
    ];

    Adapter.connection = await createConnection({
      type: 'mysql',
      host: process.env.CONFIG_DB_SERVICE,
      port: parseInt(process.env.CONFIG_DB_PORT),
      username: process.env.SECRET_DB_USERNAME,
      password: process.env.SECRET_DB_PASSWORD,
      database: process.env.CONFIG_DB_NAME,
      logging: true,
      entities,
      namingStrategy: new SnakeNamingStrategy()
    });

    if (await Adapter.shouldCreateTables(entities)) {
      await Adapter.connection.synchronize()
    }
  }
}
