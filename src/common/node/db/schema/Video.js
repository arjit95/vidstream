const mongoose = require('mongoose');
const getDate = () => new Date().toISOString();
const User = require('./User');
const Channel = require('./Channel');

const Schema = new mongoose.Schema({
    title: { // Title of the video
        required: true,
        type: String
    },
    channel: Channel,
    views: {
        type: Number,
        default: 0
    },
    user: User,
    uploaded: {
        type: Date,
        default: getDate
    },
    tags: [String],
    genres: [String]
});

module.exports = Schema;