const adapter = require('./adapter');
const {Users, Videos, Watch} = require('./models');

/**
 * @namespace
 * @typedef {Object} ElasticObj
 * @property {Users} Users Utils to handle users index metrics
 * @property {Videos} Videos Utils to handle videos index metrics
 * @property {Watch} Watch Utils to handle watch index metrics
 */
const dbObj = {
    Users: null,
    Videos: null,
    Watch: null
};

/**
 * 
 * @param {import('./models/Model')} instance
 * @param {import('@elastic/elasticsearch').Client} client
 */
async function createIndex(instance, client) {
    const response = await client.indices.exists({
        index: instance.index
    });

    if (response.statusCode === 200) {
        return;
    }

    await client.indices.create({
      index: instance.index,
      body: instance.schema
    });
}

/**
 * Initializes the metrics server
 * @returns {Promise<ElasticObj>}
 */
module.exports.init = async () => {
    if (Object.values(dbObj).every(clz => clz !== null)) {
        return dbObj;
    }

    const client = await adapter.getInstance();
    dbObj.Users = new Users(client);
    dbObj.Videos = new Videos(client);
    dbObj.Watch = new Watch(client);

    await createIndex(dbObj.Users, client);
    await createIndex(dbObj.Videos, client);
    await createIndex(dbObj.Watch, client);

    return dbObj;
}