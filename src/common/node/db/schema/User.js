const mongoose = require('mongoose');
const getDate = () => new Date().toISOString();

const Schema = new mongoose.Schema({
    name: { // Name of the user
        type: String,
        required: true
    },
    id: {  // Id for the user, should match elastic search
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
    meta: {
        subscribers: {
            type: Number,
            default: 0
        }
    },
    roles: {
        type: [String],
        default: null
    }
});

module.exports = Schema;