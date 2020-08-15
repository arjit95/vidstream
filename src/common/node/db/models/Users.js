const {User} = require('../schema');
const mongoose = require('mongoose');

module.exports = {
    /**
     * Creates users model 
     * @param {mongoose.Connection} db Mongoose connection instance
     * @returns {Promise<mongoose.Model<mongoose.Document>>}
     */
    async init(db) {
        return db.model('Users', User);
    }
};