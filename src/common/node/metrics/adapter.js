const { Client } = require('@elastic/elasticsearch');
let instance = null;

/**
 * @returns {Promise<Client>}
 */
module.exports.getInstance = async () => {
    if (instance) {
        return instance;
    }

    instance = new Client({
        node: process.env.ELASTICSEARCH_ADDR
    });

    return instance;
}