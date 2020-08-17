const mongoose = require('mongoose');
const getDate = () => new Date().toISOString();

const Schema = new mongoose.Schema({
    title: { // Title of the channel
        required: true,
        type: String
    },
    user: {
        required: true,
        type: String
    },
    created: {
        type: Date,
        default: getDate
    },
    subscribers: {
        type: Number,
        default: 0
    }
});

module.exports = Schema;