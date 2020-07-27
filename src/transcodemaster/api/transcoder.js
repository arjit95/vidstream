const path = require('path');

const {FFMpeg, FFProbe, Executor} = require('../ffutils');

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

module.exports = function(queueInstance, fsUtils) {
    fsUtils.assertDirectory(CONVERTED_DIR);
 
    return async function(message) {
        const fileName = message.name;
        const inputPath = path.resolve(UPLOAD_DIR, fileName);
        const cmd = FFProbe.getMetadata();
        const binary = Executor.getBinary('ffprobe');
        const metadata = JSON.parse(await Executor.exec(`${binary} ${cmd} ${inputPath}`));

        const duration = parseFloat(metadata.streams.find(({duration}) => duration).duration);
        const resolution = metadata.streams[0];
        const applicableResolutions = FFMpeg.Plugin.Resolution.DefaultResolutions.filter(res => res <= resolution.height);

        const extname = path.extname(fileName);
        const baseUploadURL = path.resolve(CONVERTED_DIR, path.basename(fileName, extname));
        fsUtils.assertDirectory(baseUploadURL);

        let jobs = [];
        for (let applicableResolution of applicableResolutions) {
            const instance = FFMpeg
                .newBuilder("ffmpeg")
                .addPlugin(new FFMpeg.Plugin.Input(inputPath))
                .addPlugin(new FFMpeg.Plugin.Resolution.Video(applicableResolution))
                .addPlugin(new FFMpeg.Plugin.Output(path.resolve(baseUploadURL, path.basename(fileName, extname) + '_' + applicableResolution + extname)))
                .addSplitter(new FFMpeg.Plugin.SplitterWrapper(Math.min(30, duration), duration))
                .build();
            
            jobs = jobs.concat(instance.command.split('\n').filter(l => !!l).map((l) => ({command: l, type: 'video'})));
        }

        const audioStreams = metadata.streams.filter(({codec_type}) => codec_type === 'audio');
        const addedStreams = new Set();

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

            const instance = FFMpeg
                .newBuilder("ffmpeg")
                .addPlugin(new FFMpeg.Plugin.Input(inputPath))
                .addPlugin(audio)
                .addPlugin(new FFMpeg.Plugin.Output(path.resolve(baseUploadURL, outputFileName)))
                .build();

            jobs.push({
                command: instance.command,
                type: 'audio',
                fileName: outputFileName,
                language: tags.language || 'en'
            });
        }

        const subtitleStreams = metadata.streams.filter(({codec_type}) => codec_type === 'subtitle');
        addedStreams.clear();

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

            const instance = FFMpeg
                .newBuilder("ffmpeg")
                .addPlugin(new FFMpeg.Plugin.Input(inputPath))
                .addPlugin(subtitle)
                .addPlugin(new FFMpeg.Plugin.Output(path.resolve(baseUploadURL, outputFileName)))
                .build();

            jobs.push({
                command: instance.command,
                type: 'subtitle',
                fileName: outputFileName,
                language: tags.language || 'en'
            });
        }

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
            command: `mt --disable-timestamps=true --webvtt=true --interval=${interval} --overwrite=true ${inputPath}`,
            type: 'thumbnail'
        });

        console.log(`Total workers required for job ${path.basename(baseUploadURL)}: ${jobs.length}`);

        const context = {
            jobs,
            source: inputPath,
            target: baseUploadURL
        };

        for (let job of jobs) {
            queueInstance.enqueue(CONVERT_QUEUE, {...job, context});
        }
    };
};