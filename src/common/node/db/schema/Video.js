const mongoose = require('mongoose');
const getDate = () => new Date().toISOString();
const User = require('./User');

const Schema = new mongoose.Schema({
    _id: {
        required: true,
        type: String
    },
    title: { // Title of the video
        required: true,
        type: String
    },
    description: {
        type: String
    },
    channel: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    uploaded: {
        type: Date,
        default: getDate
    },
    tags: [String],
    genres: [String],
    listing: {
        type: String,
        enum: ['private', 'public', 'unlisted'],
        default: 'public'
    },
    uploading: {
        type: Boolean,
        default: true
    }
});

module.exports = Schema;