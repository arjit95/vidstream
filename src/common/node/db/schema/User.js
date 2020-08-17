const mongoose = require('mongoose');
const getDate = () => new Date().toISOString();

const Schema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    name: { // Name of the user
        type: String,
        required: true
    },
    joined: {  // Date when user registered
        type: Date,
        required: true,
        default: getDate
    },
    username: {
        type: String,
        required: true
    },
    password: { // Hashed user password
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    source: String, // Account source local/google etc.
    roles: {
        type: [String],
        default: null
    }
});

module.exports = Schema;