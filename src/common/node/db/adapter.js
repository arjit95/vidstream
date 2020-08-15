const mongoose = require('mongoose');
let db;

/**
 * @returns {Promise<mongoose.Connection>}
 */
module.exports.getInstance = async () => {
    if (db) {
        return db;
    }

    const mongoURL = `${process.env.DB_SERVICE_ADDR}/${process.env.DB_NAME}`;
    console.log('Connecting to ' + mongoURL);
    try {
        await mongoose.connect(mongoURL, {
            auth: {
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD
            },
            authSource: 'admin',
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
    } catch (err) {
        console.log('Cannot connect to database');
        throw new Error(err)
    }

    db = mongoose.connection;
    return db;
};
