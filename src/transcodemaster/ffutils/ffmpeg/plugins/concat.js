const Plugin = require('./plugin');

class Concat extends Plugin {
    constructor(metadata) {
        super();
        this.metadata = metadata;
    }

    getCommand() {
        return `-f concat -safe 0 -i ${this.metadata} -c copy`;
    }
}

module.exports = Concat;