const Plugin = require('./plugin');

class Output extends Plugin {
    constructor(filePath) {
        super();
        this.filePath = filePath;
    }

    getCommand() {
        return `"${this.filePath}"`;
    }

    clone() {
        return new Output(this.filePath);
    }
}

module.exports = Output;