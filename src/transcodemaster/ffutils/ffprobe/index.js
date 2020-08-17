const Helpers = require('../helpers');

const ffprobeMeta = {
	"show_streams": "",
	"v": "quiet",
	"print_format": "json"
};

class FFProbe {
    static getMetadata() {
        return `${Helpers.mergeCommandObj(ffprobeMeta)}`;
    }

    static getDuration(metadata) {
        return parseFloat(metadata.streams.find(({duration}) => duration).duration);
    }
}

module.exports = FFProbe;