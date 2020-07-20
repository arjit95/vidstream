const Helpers = require('../helpers');

const ffprobeMeta = {
	"show_streams": "",
	"v": "quiet",
	"print_format": "json"
};

class FFProbe {
    static getMetadata() {
        return `${Helpers.mergeCommandObj(ffprobeMeta)} - `;
    }    
}

module.exports = FFProbe;