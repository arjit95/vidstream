const path = require('path');
const fs = require('fs');

const {FFMpeg, FFProbe} = require('../ffutils');
const {Executor} = require('../../common/node/utils/index');

const CONVERT_QUEUE = process.env.CONVERT_QUEUE;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const CONVERTED_DIR = process.env.CONVERTED_DIR || './converted';

/**
 * 
 * @param {Set} existingNames 
 * @param {string} name 
 */
const getUniqueName = function(existingNames, name) {
    const extension = path.extname(name);
    const originalName = path.basename(name, extension);
    let counter = 1;

    while(existingNames.has(name)) {
        name = originalName + counter++ + extension;
    }

    return name;
};

const assertDir = function(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

const getVideoMeta = async function(inputPath) {
    const cmd = FFProbe.getMetadata();
    const binary = Executor.getBinary('ffprobe');
    return JSON.parse(await Executor.exec(`${binary} ${cmd} ${inputPath}`));
};

const getVideoJobs = function(inputPath, outputPath, metadata) {
    let jobs = [];
    const fileName = path.basename(inputPath);
    const extname = path.extname(fileName);
    const duration = FFProbe.getDuration(metadata);
    const resolution = metadata.streams[0];
    const applicableResolutions = FFMpeg.Plugin.Resolution.DefaultResolutions.filter(res => res <= resolution.height);

    for (let applicableResolution of applicableResolutions) {
        const instance = FFMpeg
            .newBuilder("ffmpeg")
            .addPlugin(new FFMpeg.Plugin.Input(inputPath))
            .addPlugin(new FFMpeg.Plugin.Resolution.Video(applicableResolution))
            .addPlugin(new FFMpeg.Plugin.Output(path.resolve(outputPath, path.basename(fileName, extname) + '_' + applicableResolution + extname)))
            .addSplitter(new FFMpeg.Plugin.SplitterWrapper(Math.min(30, duration), duration));
        
        const outputFiles = instance.plugins
            .flat()
            .filter(plugin => plugin instanceof FFMpeg.Plugin.Output)
            .map(({filePath}) => filePath);

        const rJobs = instance.build().command.split('\n').filter(l => !!l).map((l, idx) => ({
            command: l,
            type: 'video',
            fileName: outputFiles[idx]
        }));

        jobs.push.apply(jobs, rJobs);
    }

    return jobs;
};

const getAudioJobs = function(inputPath, outputPath, metadata) {
    const audioStreams = metadata.streams.filter(({codec_type}) => codec_type === 'audio');
    const addedStreams = new Set();
    const jobs = [];

    for (let stream of audioStreams) {
        const audio = new FFMpeg.Plugin.Resolution.Audio();
        const tags = stream.tags || {};
        const title = tags.title || "";
        const language = tags.language || "en";
        const suffix = [stream.channel_layout, title, language].filter(p => !!p).join('_');
        const outputFileName = getUniqueName(addedStreams, 'audio_' + suffix + '.mp4');
        addedStreams.add('audio_' + suffix + '.mp4');

        audio.addExtraParams({
            "map": `0:${stream.index}`
        });

        const outputFilePath = path.resolve(outputPath, outputFileName);
        const instance = FFMpeg
            .newBuilder("ffmpeg")
            .addPlugin(new FFMpeg.Plugin.Input(inputPath))
            .addPlugin(audio)
            .addPlugin(new FFMpeg.Plugin.Output(outputFilePath))
            .build();

        jobs.push({
            command: instance.command,
            type: 'audio',
            fileName: outputFilePath,
            language: tags.language || 'en'
        });
    }

    return jobs;
};

const getSubtitleJobs = function(inputPath, outputPath, metadata) {
    const subtitleStreams = metadata.streams.filter(({codec_type}) => codec_type === 'subtitle');
    const addedStreams = new Set()
    const jobs = [];

    for (let stream of subtitleStreams) {
        const subtitle = new FFMpeg.Plugin.Resolution.Subtitle();
        const tags = stream.tags || {};
        const title = tags.title || "";
        const language = tags.language || "en";
        const suffix = [title, language].filter(p => !!p).join('_');

        subtitle.addExtraParams({
            "map": `0:${stream.index}`
        });

        const outputFileName = getUniqueName(addedStreams, 'subtitle_' + suffix + '.vtt');
        addedStreams.add('subtitle_' + suffix + '.mp4');

        const outputFilePath = path.resolve(outputPath, outputFileName);
        const instance = FFMpeg
            .newBuilder("ffmpeg")
            .addPlugin(new FFMpeg.Plugin.Input(inputPath))
            .addPlugin(subtitle)
            .addPlugin(new FFMpeg.Plugin.Output(outputFilePath))
            .build();

        jobs.push({
            command: instance.command,
            type: 'subtitle',
            fileName: outputFilePath,
            language: tags.language || 'en'
        });
    }

    return jobs;
}

function getThumbnailJobs(inputPath, outputPath, metadata) {
    const duration = FFProbe.getDuration(metadata);
    const jobs = [];

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
        fileName: path.resolve(outputPath, 'thumbs.png')
    });

    const poster = new FFMpeg.Plugin.Resolution.Poster();
    poster.addExtraParams({'ss': duration * 0.5});

    const outputFilePath = path.resolve(outputPath, 'poster.png');
    const instance = FFMpeg
        .newBuilder("ffmpeg")
        .addPlugin(new FFMpeg.Plugin.Input(inputPath))
        .addPlugin(poster)
        .addPlugin(new FFMpeg.Plugin.Output(outputFilePath))
        .build();

    jobs.push({
        command: instance.command,
        fileName: outputFilePath,
        type: 'poster'
    });

    return jobs;
}

function createTempFiles(jobs) {
    for (let job of jobs) {
        const tempFile = job.fileName + '.tmp';
        const time = new Date();

        try {
            fs.utimesSync(tempFile, time, time);
        } catch(err) {
            fs.closeSync(fs.openSync(tempFile, 'w'));
        }
    }
}

module.exports = function(queueInstance) {
    assertDir(CONVERTED_DIR);
 
    return async function(message) {
        const fileName = message.name;
        const inputPath = path.resolve(UPLOAD_DIR, fileName);
        const baseUploadURL = path.resolve(CONVERTED_DIR, path.basename(fileName, path.extname(fileName)));
        
        const metadata = await getVideoMeta(inputPath);
        assertDir(baseUploadURL);
        const jobs = [].concat(
            getVideoJobs(inputPath, baseUploadURL, metadata),
            getAudioJobs(inputPath, baseUploadURL, metadata),
            getSubtitleJobs(inputPath, baseUploadURL, metadata), 
            getThumbnailJobs(inputPath, baseUploadURL, metadata)           
        );

        const context = {
            jobs,
            source: inputPath,
            target: baseUploadURL
        };

        createTempFiles(jobs, baseUploadURL);
        for (let job of jobs) {
            queueInstance.enqueue(CONVERT_QUEUE, {...job, context});
        }
    };
};
