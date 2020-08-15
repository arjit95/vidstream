const mongoose = require('mongoose');
const getDate = () => new Date().toISOString();
const User = require('./User');

const Schema = new mongoose.Schema({
    title: { // Title of the channel
        required: true,
        type: String
    },
    user: User,
    created: {
        type: Date,
        default: getDate
    },
});

module.exports = Schema;