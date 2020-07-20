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

MessageQueue.Errors = {
    METHOD_NOT_IMPLEMENTED: 'Method not implemented'
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
        this.channel.prefetch(1);
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
        self.channel.consume(name, function(msg) {
            try {
                const content = JSON.parse(msg.content.toString());
                Promise.resolve(callback(content))
                .then(() => self.channel.ack(msg))
                .catch((err) => {
                    console.log(err);
                    self.channel.ack(msg);
                });
            } catch(err) {
                console.log(err);
                console.log('Unable to parse json');
                console.log(msg.content.toString());
            }
        }, {noAck: false});
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

module.exports = RabbitMQ;