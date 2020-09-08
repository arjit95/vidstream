import { Plugin } from './plugin';
import { Helpers } from '../../helpers';

const audioConfig = {
  common: {
    y: '',
    'c:a': 'aac',
    ac: '2',
    vn: '',
    sn: '',
  },
};

const posterConfig = {
  vframes: 1,
};

const subtitleConfig = {
  common: {
    y: '',
    f: 'webvtt',
  },
};

const videoConfig = {
  common: {
    y: '',
    an: '',
    sn: '',
    movflags: '+faststart',
    avoid_negative_ts: '1',
    vsync: 'vfr',
    'c:v': 'libx264',
    preset: 'fast',
    crf: '20',
    'x264-params': 'scenecut=0:open_gop=0:min-keyint=72:keyint=72',
  },

  240: {
    'filter:v': `"scale=-2:240"`,
    'profile:v': 'baseline',
    'level:v': '2.0',
    minrate: '400k',
    maxrate: '600k',
    bufsize: '600k',
    'b:v': '600k',
  },
  360: {
    'filter:v': `"scale=-2:360"`,
    'profile:v': 'baseline',
    'level:v': '3.0',
    'x264-params': 'scenecut=0:open_gop=0:min-keyint=72:keyint=72',
    minrate: '700k',
    maxrate: '900k',
    bufsize: '900k',
    'b:v': '900k',
  },
  480: {
    'filter:v': `"scale=-2:480"`,
    'profile:v': 'main',
    'level:v': '3.1',
    minrate: '1250k',
    maxrate: '1600k',
    bufsize: '1600k',
    'b:v': '1600k',
  },
  720: {
    'filter:v': `"scale=-2:720"`,
    'profile:v': 'main',
    'level:v': '4.0',
    minrate: '2500k',
    maxrate: '3200k',
    bufsize: '3200k',
    'b:v': '3200k',
  },
  1080: {
    'filter:v': `"scale=-2:1080"`,
    'profile:v': 'main',
    'level:v': '4.2',
    minrate: '4500k',
    maxrate: '6000k',
    bufsize: '6000k',
    'b:v': '6000k',
  },
  1440: {
    'filter:v': `"scale=-2:1440"`,
    'profile:v': 'main',
    'level:v': '5.1',
    minrate: '12000k',
    maxrate: '12000k',
    bufsize: '12000k',
    'b:v': '12000k',
  },
};

abstract class Base extends Plugin {
  params: { [key: string]: string };

  constructor() {
    super();
    this.params = {};
  }

  addExtraParams(params: { [key: string]: string }) {
    this.params = params;
  }
}

export namespace Resolution {
  export type VideoQuality = '240' | '360' | '480' | '720' | '1080' | '1440';

  export class Video extends Base {
    resolution: VideoQuality;

    constructor(resolution: VideoQuality) {
      super();
      this.resolution = resolution;
    }

    getCommand() {
      const config = Object.assign(
        {},
        videoConfig.common,
        videoConfig[this.resolution],
        this.params
      );
      return Helpers.mergeCommandObj(config);
    }
  }

  export class Audio extends Base {
    getCommand() {
      const config = Object.assign({}, audioConfig.common, this.params);
      return Helpers.mergeCommandObj(config);
    }
  }

  export class Subtitle extends Audio {
    getCommand() {
      const config = Object.assign({}, subtitleConfig.common, this.params);
      return Helpers.mergeCommandObj(config);
    }
  }

  export class Poster extends Base {
    getCommand() {
      const config = Object.assign({}, posterConfig, this.params);
      return Helpers.mergeCommandObj(config);
    }
  }

  export const DefaultResolutions: Array<VideoQuality> = [
    '1440',
    '1080',
    '720',
    '480',
    '360',
    '240',
  ];
}
