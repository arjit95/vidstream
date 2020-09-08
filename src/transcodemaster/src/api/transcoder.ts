import path from 'path';
import fs from 'fs';

import { FFProbe, FFProbeMetadata } from '../ffutils/ffprobe';
import { FFMpeg } from '../ffutils/ffmpeg';
import * as Plugins from '../ffutils/ffmpeg/plugins';
import { Executor } from '@me/common/utils/executor';
import { Job, Queue, QueueMessage, QueueContext } from '@me/common/utils/queue';

const CONVERT_QUEUE = process.env.CONFIG_CONVERT_QUEUE;
const UPLOAD_DIR = process.env.CONFIG_UPLOADS_DIRECTORY;
const CONVERTED_DIR = process.env.CONFIG_CONVERTED_DIRECTORY;

const getUniqueName = function(
  existingNames: Set<string>,
  name: string
): string {
  const extension = path.extname(name);
  const originalName = path.basename(name, extension);
  let counter = 1;

  while (existingNames.has(name)) {
    name = originalName + counter++ + extension;
  }

  return name;
};

const assertDir = function(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

const getVideoMeta = async function(
  inputPath: string
): Promise<FFProbeMetadata> {
  const cmd = FFProbe.getMetadata();
  const binary = Executor.getBinary('ffprobe');
  return JSON.parse(await Executor.exec(`${binary} ${cmd} ${inputPath}`));
};

const getVideoJobs = function(
  inputPath: string,
  outputPath: string,
  metadata: FFProbeMetadata
): Array<Job> {
  let jobs: Array<Job> = [];
  const fileName = path.basename(inputPath);
  const extname = path.extname(fileName);
  const duration = FFProbe.getDuration(metadata);
  const resolution = metadata.streams[0];
  const applicableResolutions = Plugins.Resolution.DefaultResolutions.filter(
    res => res <= resolution.height
  );

  for (let applicableResolution of applicableResolutions) {
    const instance = FFMpeg.newBuilder('ffmpeg')
      .addPlugin(new Plugins.Input(inputPath))
      .addPlugin(
        new Plugins.Resolution.Video(
          applicableResolution as Plugins.Resolution.VideoQuality
        )
      )
      .addPlugin(
        new Plugins.Output(
          path.resolve(
            outputPath,
            path.basename(fileName, extname) +
              '_' +
              applicableResolution +
              extname
          )
        )
      )
      .addSplitter(
        new Plugins.SplitterWrapper(Math.min(30, duration), duration)
      );

    const outputPlugins: Array<Plugins.Output> = instance.splittedPlugins
      .flat()
      .filter(plugin => plugin instanceof Plugins.Output) as Array<
      Plugins.Output
    >;

    const outputFiles: Array<string> = outputPlugins.map(
      plugin => plugin.filePath
    );
    const rJobs = instance
      .build()
      .command.split('\n')
      .filter(l => !!l)
      .map((l, idx) => ({
        command: l,
        type: 'video',
        fileName: outputFiles[idx],
      }));

    jobs.push.apply(jobs, rJobs);
  }

  return jobs;
};

const getAudioJobs = function(
  inputPath: string,
  outputPath: string,
  metadata: FFProbeMetadata
) {
  const audioStreams = metadata.streams.filter(
    ({ codec_type }) => codec_type === 'audio'
  );
  const addedStreams = new Set<string>();
  const jobs: Array<Job> = [];

  for (let stream of audioStreams) {
    const audio = new Plugins.Resolution.Audio();
    const tags = stream.tags || {};
    const title = tags.title || '';
    const language = tags.language || 'en';
    const suffix = [stream.channel_layout, title, language]
      .filter(p => !!p)
      .join('_');
    const outputFileName = getUniqueName(
      addedStreams,
      'audio_' + suffix + '.mp4'
    );
    addedStreams.add('audio_' + suffix + '.mp4');

    audio.addExtraParams({
      map: `0:${stream.index}`,
    });

    const outputFilePath = path.resolve(outputPath, outputFileName);
    const instance = FFMpeg.newBuilder('ffmpeg')
      .addPlugin(new Plugins.Input(inputPath))
      .addPlugin(audio)
      .addPlugin(new Plugins.Output(outputFilePath))
      .build();

    jobs.push({
      command: instance.command,
      type: 'audio',
      fileName: outputFilePath,
      language: tags.language || 'en',
    });
  }

  return jobs;
};

const getSubtitleJobs = function(
  inputPath: string,
  outputPath: string,
  metadata: FFProbeMetadata
): Array<Job> {
  const subtitleStreams = metadata.streams.filter(
    ({ codec_type }) => codec_type === 'subtitle'
  );
  const addedStreams = new Set<string>();
  const jobs = [];

  for (let stream of subtitleStreams) {
    const subtitle = new Plugins.Resolution.Subtitle();
    const tags = stream.tags || {};
    const title = tags.title || '';
    const language = tags.language || 'en';
    const suffix = [title, language].filter(p => !!p).join('_');

    subtitle.addExtraParams({
      map: `0:${stream.index}`,
    });

    const outputFileName = getUniqueName(
      addedStreams,
      'subtitle_' + suffix + '.vtt'
    );
    addedStreams.add('subtitle_' + suffix + '.mp4');

    const outputFilePath = path.resolve(outputPath, outputFileName);
    const instance = FFMpeg.newBuilder('ffmpeg')
      .addPlugin(new Plugins.Input(inputPath))
      .addPlugin(subtitle)
      .addPlugin(new Plugins.Output(outputFilePath))
      .build();

    jobs.push({
      command: instance.command,
      type: 'subtitle',
      fileName: outputFilePath,
      language: tags.language || 'en',
    });
  }

  return jobs;
};

function getThumbnailJobs(
  inputPath: string,
  outputPath: string,
  metadata: FFProbeMetadata
) {
  const duration = FFProbe.getDuration(metadata);
  const jobs: Array<Job> = [];

  let interval;
  if (duration < 120) {
    interval = 5;
  } else if (duration <= 10 * 60) {
    interval = 10;
  } else if (duration <= 30 * 60) {
    interval = 20;
  } else {
    interval = 30;
  }

  jobs.push({
    command: `mt --disable-timestamps=true --webvtt=true --interval=${interval} --width=120 --overwrite=true ${inputPath}`,
    type: 'thumbnail',
    fileName: path.resolve(outputPath, 'thumbs.png'),
  });

  const poster = new Plugins.Resolution.Poster();
  poster.addExtraParams({ ss: `${duration * 0.5}` });

  const outputFilePath = path.resolve(outputPath, 'poster.png');
  const instance = FFMpeg.newBuilder('ffmpeg')
    .addPlugin(new Plugins.Input(inputPath))
    .addPlugin(poster)
    .addPlugin(new Plugins.Output(outputFilePath))
    .build();

  jobs.push({
    command: instance.command,
    fileName: outputFilePath,
    type: 'poster',
  });

  return jobs;
}

function createTempFiles(jobs: Array<Job>) {
  for (let job of jobs) {
    const tempFile = job.fileName + '.tmp';
    const time = new Date();

    try {
      fs.utimesSync(tempFile, time, time);
    } catch (err) {
      fs.closeSync(fs.openSync(tempFile, 'w'));
    }
  }
}

export function Transcoder(queueInstance: Queue) {
  assertDir(CONVERTED_DIR);

  return async function(message: QueueMessage<Job>) {
    const fileName = message.fileName;
    const inputPath = path.resolve(UPLOAD_DIR, fileName);
    const baseUploadURL = path.resolve(
      CONVERTED_DIR,
      path.basename(fileName, path.extname(fileName))
    );

    const metadata = await getVideoMeta(inputPath);
    assertDir(baseUploadURL);

    const jobs: Array<Job> = [
      ...getVideoJobs(inputPath, baseUploadURL, metadata),
      ...getAudioJobs(inputPath, baseUploadURL, metadata),
      ...getSubtitleJobs(inputPath, baseUploadURL, metadata),
      ...getThumbnailJobs(inputPath, baseUploadURL, metadata),
    ];

    const context: QueueContext<Job> = {
      jobs,
      source: inputPath,
      target: baseUploadURL,
    };

    createTempFiles(jobs);
    for (let job of jobs) {
      queueInstance.enqueue(CONVERT_QUEUE, { ...job, context });
    }
  };
}
