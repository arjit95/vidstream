import amqp from 'amqplib';

interface ErrorObject {
  [key: string]: any;
}

type QueueCallback = (message: any) => Promise<void>;

export type Job = {
  command: string;
  fileName: string;
  type: string;
  language?: string;
};

export type QueueContext<T> = {
  jobs: Array<T>;
  source: string;
  target: string
}

export type QueueMessage<T> = T & {
  context: QueueContext<T>;
};

abstract class MessageQueue {
  static Errors: ErrorObject = {
    METHOD_NOT_IMPLEMENTED: 'Method not implemented',
  };

  abstract enqueue(name: string | undefined, message: any): void;
  abstract assert(name: string | undefined, durable: boolean): void;
  abstract consume(name: string | undefined, callback: QueueCallback): void;

  abstract disconnect(): void;
}

export class Queue extends MessageQueue {
  conn: amqp.Connection;
  channel: amqp.Channel;
  name?: string | undefined;

  constructor(conn: amqp.Connection, channel: amqp.Channel) {
    super();
    this.conn = conn;
    this.channel = channel;
  }

  assert(name: string, durable: boolean = false): void {
    this.name = name;
    this.channel.assertQueue(name, { durable });
    this.channel.prefetch(1);
  }

  disconnect(): void {
    this.conn.close();
  }

  enqueue(name: string | undefined, message: any) {
    name = name || this.name;
    if (!name) {
      throw new Error('Please supply a name to enqueue the message');
    }

    this.channel.sendToQueue(name, Buffer.from(JSON.stringify(message)));
  }

  consume(name: string | undefined, callback: QueueCallback) {
    name = name || this.name;
    if (!name) {
      throw new Error('Please supply a name to enqueue the message');
    }

    const self = this;
    self.channel.consume(
      name,
      async function(msg: amqp.ConsumeMessage | null) {
        if (msg === null) {
          return;
        }

        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          self.channel.ack(msg);
        } catch (err) {
          console.log(err);
          console.log('Unable to parse json');
          console.log(msg.content.toString());
        }
      },
      { noAck: false }
    );
  }

  static async newBuilder() {
    let connection;

    const u = new URL(process.env.CONFIG_QUEUE_SERVICE);

    while (true) {
      try {
        connection = await amqp.connect({
          protocol: u.protocol.substring(0, u.protocol.length - 1),
          hostname: u.hostname,
          username: process.env.SECRET_QUEUE_USERNAME,
          password: process.env.SECRET_QUEUE_PASSWORD,
          port: parseInt(u.port),
        });
        break;
      } catch (err) {
        console.log('Cannot connect to rabbitmq');
        console.error(err);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Connected to queue service');
    const channel = await connection.createChannel();

    return new Queue(connection, channel);
  }
}

module.exports = Queue;
