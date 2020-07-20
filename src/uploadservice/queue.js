const amqp = require('amqplib');

class MessageQueue {
    enqueue() {
        throw MessageQueue.Errors.METHOD_NOT_IMPLEMENTED;
    }

    assert() {
        throw MessageQueue.Errors.METHOD_NOT_IMPLEMENTED;
    }

    consume() {
        throw MessageQueue.Errors.METHOD_NOT_IMPLEMENTED;
    }

    disconnect() {
        throw MessageQueue.Errors.METHOD_NOT_IMPLEMENTED;
    }
}

class RabbitMQ extends MessageQueue {
    constructor(conn, channel) {
        super();
        this.conn = conn;
        this.channel = channel;
        this.name = null;
    }

    assert(name, durable = false) {
        this.name = name;
        this.channel.assertQueue(name, {durable});
    }

    disconnect() {
        this.conn.close();
    }

    enqueue(name, message) {
        name = name || this.name;
        if (!name) {
            throw new Error('Please supply a name to enqueue the message');
        }

        this.channel.sendToQueue(name, Buffer.from(JSON.stringify(message)));
    }

    consume(name, callback) {
        name = name || this.name;
        if (!name) {
            throw new Error('Please supply a name to enqueue the message');
        }

        const self = this;
        self.channel.prefetch(1);
        self.channel.consume(name, async function(msg) {
            try {
                const content = JSON.parse(msg.content.toString());
                await callback(content);
                self.channel.ack(msg);
            } catch(err) {
                self.channel.reject(msg, true);
            }
        }, {noAck: true});
    }

    static async newBuilder(url) {
        let connection;

        while(true) {
            try {
                connection = await amqp.connect(url);
                break;
            } catch(err) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log('Connected to queue service');
        const channel = await connection.createChannel();
        return new RabbitMQ(connection, channel);
    }
}

MessageQueue.Errors = {
    METHOD_NOT_IMPLEMENTED: 'Method not implemented'
}

module.exports = RabbitMQ;