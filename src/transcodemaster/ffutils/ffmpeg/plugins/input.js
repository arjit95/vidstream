const path = require('path');
const Plugin = require('./plugin');

class Input extends Plugin {
    constructor(filePath) {
        super();
        this.filePath = filePath;
    }

    getCommand() {
        return `-i "${this.filePath}"`;
    }
}

module.exports = Input;