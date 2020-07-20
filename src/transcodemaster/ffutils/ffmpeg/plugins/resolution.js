const Helpers = require('../../helpers');

const Plugin = require('./plugin');
const resolutions = {
    audio: {
        "y": "",
        "c:a": "aac",
        "ac": "2",
        "movflags": "+faststart",
        "vn": ""
    },
    240: {
        "y": "",
        "an": "",
        "filter:v": `"scale=-2:240"`,
        "c:v": "libx264",
        "profile:v": "baseline",
        "level:v": "2.0",
        "x264-params": "scenecut=0:open_gop=0:min-keyint=72:keyint=72",
        "minrate": "400k",
        "maxrate": "600k",
        "bufsize": "600k",
        "b:v": "600k",
        "movflags": "+faststart",
        "preset": "fast",
        "crf": "20",
        "avoid_negative_ts": "1",
        "vsync": "vfr"
    },
    360: {
        "y": "",
        "an": "",
        "filter:v": `"scale=-2:360"`,
        "c:v": "libx264",
        "profile:v": "baseline",
        "level:v": "3.0",
        "x264-params": "scenecut=0:open_gop=0:min-keyint=72:keyint=72",
        "minrate": "700k",
        "maxrate": "900k",
        "bufsize": "900k",
        "b:v": "900k",
        "movflags": "+faststart",
        "preset": "fast",
        "crf": "20",
        "avoid_negative_ts": "1",
        "vsync": "vfr"
    },
    480: {
        "y": "",
        "an": "",
        "filter:v": `"scale=-2:480"`,
        "c:v": "libx264",
        "profile:v": "main",
        "level:v": "3.1",
        "x264-params": "scenecut=0:open_gop=0:min-keyint=72:keyint=72",
        "minrate": "1250k",
        "maxrate": "1600k",
        "bufsize": "1600k",
        "b:v": "1600k",
        "movflags": "+faststart",
        "preset": "fast",
        "crf": "20",
        "avoid_negative_ts": "1",
        "vsync": "vfr"
    },
    720: {
        "y": "",
        "an": "",
        "filter:v": `"scale=-2:720"`,
        "c:v": "libx264",
        "profile:v": "main",
        "level:v": "4.0",
        "x264-params": "scenecut=0:open_gop=0:min-keyint=72:keyint=72",
        "minrate": "2500k",
        "maxrate": "3200k",
        "bufsize": "3200k",
        "b:v": "3200k",
        "movflags": "+faststart",
        "preset": "fast",
        "crf": "20",
        "avoid_negative_ts": "1",
        "vsync": "vfr"
    },
    1080: {
        "y": "",
        "an": "",
        "filter:v": `"scale=-2:1080"`,
        "c:v": "libx264",
        "profile:v": "main",
        "level:v": "4.2",
        "x264-params": "scenecut=0:open_gop=0:min-keyint=72:keyint=72",
        "minrate": "4500k",
        "maxrate": "6000k",
        "bufsize": "6000k",
        "b:v": "6000k",
        "movflags": "+faststart",
        "preset": "fast",
        "crf": "20",
        "avoid_negative_ts": "1",
        "vsync": "vfr"
    },
    1440: {
        "y": "",
        "an": "",
        "filter:v": `"scale=-2:1440"`,
        "c:v": "libx264",
        "profile:v": "main",
        "level:v": "5.1",
        "x264-params": "scenecut=0:open_gop=0:min-keyint=72:keyint=72",
        "minrate": "12000k",
        "maxrate": "12000k",
        "bufsize": "12000k",
        "b:v": "12000k",
        "movflags": "+faststart",
        "preset": "fast",
        "crf": "20",
        "avoid_negative_ts": "1",
        "vsync": "vfr"
    }
};

class Resolution extends Plugin {
    constructor(resolution) {
        super();
        this.resolution = resolution;
        this.params = {};
    }

    addExtraParams(params) {
        this.params = params;
    }

    getCommand() {
        const config = Object.assign({}, resolutions[this.resolution], this.params);
        return Helpers.mergeCommandObj(config);
    }
}

Resolution.DefaultResolutions = [1440, 1080, 720, 480, 360, 240];
module.exports = Resolution;