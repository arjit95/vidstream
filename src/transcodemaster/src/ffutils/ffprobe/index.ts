import { Helpers } from '../helpers';
import { Resolution } from '../ffmpeg/plugins/resolution';

const ffprobeMeta = {
  show_streams: '',
  v: 'quiet',
  print_format: 'json',
};

export type FFProbeStream = {
  duration?: string;
  height: Resolution.VideoQuality;
  codec_type: string;
  tags: { [key: string]: any };
  title?: string;
  language?: string;
  channel_layout: string;
  index: number;
};

export type FFProbeMetadata = {
  streams: Array<FFProbeStream>;
};

export class FFProbe {
  static getMetadata() {
    return `${Helpers.mergeCommandObj(ffprobeMeta)}`;
  }

  static getDuration(metadata: FFProbeMetadata): number {
    const stream = metadata.streams.find(({ duration }) => {
      return duration;
    });

    if (!stream?.duration) {
      return 0;
    }

    return parseFloat(stream?.duration);
  }
}

module.exports = FFProbe;
