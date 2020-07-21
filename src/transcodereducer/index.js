const fs = require('fs');
const path = require('path');
const http = require('http');

const queue = require('./lib/queue');
const REDUCE_QUEUE = process.env.REDUCE_QUEUE;
const Executor = require('./lib/executor');
const port = process.env.PORT || 8080;

let queueService, fileService;

function getSplitCommand(videoDir, resolutions, videoId, duration = 6) {
    let command = resolutions.reduce((acc, resolution) => {
        resolution = resolution.toString();

        const videoFolder = path.join(videoDir, resolution);
        const initSegment = path.join(videoFolder, "init.mp4");
        const segmentTemplate = path.join(videoFolder, "$Number$.m4s");
        const playListName = path.join(videoFolder, "playlist.m3u8");
        const iframe = path.join(videoFolder, "iframe.m3u8");

        acc += `'in=${path.join(videoDir, resolution)}.mp4,stream=video,init_segment=${initSegment},`;
        acc += `segment_template=${segmentTemplate},playlist_name=${playListName},`;
        acc += `iframe_playlist_name=${iframe}' `;
        return acc;
    }, '');

    command += ` --segment_duration ${duration} --hls_master_playlist_output ${path.resolve(videoDir, "video.m3u8")}`;
    command += ` --hls_base_url /api/stream/raw?path=${videoId}`;

    let audioCommand = '';
    if (fs.existsSync(path.resolve(videoDir, 'audio.mp4'))) {
        audioCommand = `'in=${path.resolve(videoDir, 'audio.mp4')},stream=audio,init_segment=${path.join(videoDir, 'audio', 'init.mp4')},`;
        audioCommand += `segment_template=${path.join(videoDir, 'audio', '$Number$.m4s')},playlist_name=${path.join(videoDir, 'audio', 'main.m3u8')},hls_group_id=audio,hls_name=ENGLISH' `;
    }

    return audioCommand + command;
}

async function reduce({context}) {
    const resolutions = {};
    context.jobs.forEach((job) => {
        if (job.resolution === 'audio') return;

        const regex = /"(.*?)"/g;
        const output = [...job.command.matchAll(regex)];

        const filePath = output[output.length - 1][1]; 
        const parts = filePath.split('_');
        const resolution = parts[parts.length - 2]; // filename_resolution_part.mp4
        resolutions[resolution] = resolutions[resolution] || [];

        resolutions[resolution].push(filePath);
    });

    const binary = Executor.getBinary('ffmpeg');
    let dirPath;

    for (let resolution in resolutions) {
        let content = resolutions[resolution].reduce((acc, filePath) => {
            return acc + 'file ' + path.basename(filePath) + '\n';
        }, '');

        dirPath = dirPath || path.dirname(resolutions[resolution][0]);
        const concatFilePath = path.resolve(dirPath, `${resolution}.txt`);
        fs.writeFileSync(concatFilePath, content); 

        const outputFile = path.resolve(dirPath, resolution + '.mp4');
        await Executor.exec(`${binary} -y -f concat -i ${concatFilePath} -c copy ${outputFile}`);

        resolutions[resolution].forEach(file => {
            fs.unlinkSync(file);
        });

        fs.unlinkSync(concatFilePath);
    }

    const packagerCommand = getSplitCommand(dirPath, Object.keys(resolutions), path.basename(dirPath));
    const packagerBinary = Executor.getBinary('packager');

    await Executor.exec(`${packagerBinary} ${packagerCommand}`);

    // cleanup
    fs.unlinkSync(context.source);

    for (let resolution in resolutions) {
        fs.unlinkSync(path.resolve(dirPath, `${resolution}.mp4`));
    }

    const audioFilePath = path.resolve(dirPath, 'audio.mp4');
    if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
    }
}

async function start() {
    fileService = await require('./lib/file').newBuilder();
    queueService = await queue.newBuilder(process.env.QUEUE_SERVICE);

    queueService.assert(REDUCE_QUEUE);
    queueService.consume(REDUCE_QUEUE, reduce);
}

function exitHandler() {
    try {
        console.log("Closing connection");
        if (queueService) {
            queueService.disconnect();
        }
    } catch (err) {} 

    process.exit();
}

//catches ctrl+c event
process.on('SIGINT', exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', function(err) {
    console.log(err);
    exitHandler();
});

const server = http.createServer(function(req, res) {
    switch(req.url) {
        case '/echo':
        case '/_healthz':
            res.write('ok');
            res.end();
            break;
    }
});
server.listen(port, start);