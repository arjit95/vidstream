const mongoose = require('mongoose');
const adapter = require('./adapter');
const { Users, Videos, Comments, Channels, Trending } = require('./models');

/**
 * @typedef {Object} DBObj
 * @property {mongoose.Model<mongoose.Document>} Users
 * @property {mongoose.Model<mongoose.Document>} Comments
 * @property {mongoose.Model<mongoose.Document>} Videos
 * @property {mongoose.Model<mongoose.Document>} Channels
 * @property {mongoose.Model<mongoose.Document>} Trending
 */
const dbObj = {
    Users: null,
    Comments: null,
    Videos: null,
    Channels: null,
    Trending: null
};

/**
 * @returns {Promise<DBObj>}
 */
module.exports.init = async () => {
    if (Object.values(dbObj).every(clz => clz !== null)) {
        return dbObj;
    }

    try {
        const instance = await adapter.getInstance();
        dbObj.Users = await Users.init(instance);
        dbObj.Videos = await Videos.init(instance);
        dbObj.Comments = await Comments.init(instance);
        dbObj.Channels = await Channels.init(instance);
        dbObj.Trending = await Trending.init(instance);
    } catch(err) {
        console.error(err);
        throw new Error('Cannot connect to mongoose instance');
    }
    

    return dbObj;
}