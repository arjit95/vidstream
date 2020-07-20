const path = require('path');

const {FFMpeg, FFProbe, Executor} = require('../ffutils');

const CONVERT_QUEUE = process.env.CONVERT_QUEUE;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const CONVERTED_DIR = process.env.CONVERTED_DIR || './converted';

module.exports = function(queueInstance, fsUtils) {
    fsUtils.assertDirectory(CONVERTED_DIR);
 
    return async function(message) {
        const fileName = message.name;
        const inputPath = path.resolve(UPLOAD_DIR, fileName);
        const cmd = FFProbe.getMetadata();
        const binary = Executor.getBinary('ffprobe');
        const metadata = JSON.parse(await Executor.exec(`${binary} ${cmd}`, {shell: true, stdio: [fsUtils.getReadStream(inputPath), 'pipe', 'pipe']}));
        const duration = parseFloat(metadata.streams[0].duration);
        const resolution = metadata.streams[0];
        const applicableResolutions = FFMpeg.Plugin.Resolution.DefaultResolutions.filter(res => res <= resolution.height);

        const extname = path.extname(fileName);
        const baseUploadURL = path.resolve(CONVERTED_DIR, path.basename(fileName, extname));
        fsUtils.assertDirectory(baseUploadURL);

        let jobs = [];
        for (let resolution of applicableResolutions) {
            const instance = FFMpeg
                .newBuilder()
                .addPlugin(new FFMpeg.Plugin.Input(inputPath))
                .addPlugin(new FFMpeg.Plugin.Resolution(resolution))
                .addPlugin(new FFMpeg.Plugin.Output(path.resolve(baseUploadURL, path.basename(fileName, extname) + '_' + resolution + extname)))
                .addSplitter(new FFMpeg.Plugin.SplitterWrapper(Math.min(30, duration), duration))
                .build();
    
            jobs = jobs.concat(instance.command.split('\n').filter(l => !!l).map((l) => ({command: l, resolution})));
        }

        if (metadata.streams.length > 1) {
            const resolution = new FFMpeg.Plugin.Resolution('audio');
            const [x, ...audioStreams] = metadata.streams;
            let max = audioStreams[0];
            audioStreams.forEach(stream => {
                if (parseInt(max.bit_rate) < parseInt(stream.bit_rate)) {
                    max = stream;
                }
            });

            resolution.addExtraParams({
                "map": `0:${max.index}`,
                "b:a": max.bit_rate
            });

            jobs.push({
                command: FFMpeg
                    .newBuilder()
                    .addPlugin(new FFMpeg.Plugin.Input(inputPath))
                    .addPlugin(resolution)
                    .addPlugin(new FFMpeg.Plugin.Output(path.resolve(baseUploadURL, 'audio.mp4')))
                    .build().command,
                resolution: 'audio'
            });
        }

        console.log(`Total workers required for job ${path.basename(baseUploadURL)}: ${jobs.length}`);

        const context = {
            jobs
        };

        for (let job of jobs) {
            queueInstance.enqueue(CONVERT_QUEUE, {...job, context});
        }
    };
}