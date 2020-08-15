const mongoose = require('mongoose');
const getDate = () => new Date().toISOString();

const Schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    timestamp: {
        type: Date,
        default: getDate
    },
    content: {
        type: String
    },
    user: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    }
});

Schema.add({children: [Schema]});

module.exports = Schema;