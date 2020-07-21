const Plugin = require('./plugin');

class Splitter extends Plugin {
    constructor(start, end) {
        super();
        this.start = start;
        this.end = end;
    }

    getCommand() {
        return `-ss ${this.start} -to ${this.end}`;
    }
}

class SplitterWrapper extends Plugin {
    constructor(splitDuration, totalDuration) {
        super();
        this.splitDuration = splitDuration;
        this.totalDuration = totalDuration;
    }

    getTotalParts() {
        const remainder = this.totalDuration % this.splitDuration;
        if (remainder < 0.5) {
            return Math.floor(this.totalDuration / this.splitDuration);
        }

        return Math.ceil(this.totalDuration / this.splitDuration);
    }

    getPartAtIndex(idx) {
        const total = this.getTotalParts();
        const start = this.splitDuration * idx;
        let end = start + this.splitDuration;

        if (total === idx + 1) {
            const remaining = this.totalDuration % this.splitDuration;

            if (end > this.totalDuration) {
                end = start + remaining;
            } else if (end < this.totalDuration) {
                end += remaining;
            }
        }

        return new Splitter(start, end);
    }
}

module.exports = {
    Splitter, SplitterWrapper
}