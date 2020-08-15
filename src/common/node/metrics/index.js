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
 * Initializes the metrics server
 * @returns {Promise<ElasticObj>}
 */
module.exports.init = async () => {
    if (Object.values(dbObj).every(clz => clz !== null)) {
        return dbObj;
    }

    const instance = await adapter.getInstance();
    dbObj.Users = new Users(instance);
    dbObj.Videos = new Videos(instance);
    dbObj.Watch = new Watch(instance);

    return dbObj;
}