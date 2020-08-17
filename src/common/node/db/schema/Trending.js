const mongoose = require('mongoose');
const getDate = () => new Date().toISOString();

const Schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    timestamp: {
        type: Date,
        default: getDate
    },
    views: {
        type: Number,
        default: 0
    },

    video: {
        type: String,
        required: true
    }
})

module.exports = Schema;