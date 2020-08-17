const path = require('path');
const fs = require('fs');
const utils = require('../common/node/utils');
const DB = require('../common/node/db');
const Metrics = require('../common/node/metrics');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

/** @namespace */
const ns = {};

/**
 * @returns {import('./upload.d').MethodResponse}
 */
ns.upload = function() {
    const response = {};
    const fileNames = [];
    let savedFileName;

    /**
     * @param {import('./upload.d').Context} context 
     */
    response.onStream = (context) => {
        const filename = context.filename;
        const ext = path.extname(filename);
        savedFileName = utils.Common.generateUniqueId();
        savedFileName = savedFileName + ext;
        fileNames.push(savedFileName);

        return fs.createWriteStream(path.resolve(UPLOAD_DIR, savedFileName))
    };

    response.onError = () => {
        if (savedFileName && fs.existsSync(savedFileName)) {
            fs.unlinkSync(savedFileName);
        }
    };

    /**
     * @param {import('./upload.d').Context} context 
     */
    response.onFinish = async (context) => {
        if (!context.info) {
            throw new Error('File not found');
        }

        const db = await DB.init();
        const body = context.fields;
        const metrics = await Metrics.init();
        for (let name of fileNames) {
            const genres = body.genres.split(',').map(genre => genre.trim());
            const {metadata} = await metrics.Videos.create({
                userID: context.info.user.id,
                genres,
                title: body.title
            });

            const oldPath = path.resolve(UPLOAD_DIR, name) 
            const newPath = path.resolve(UPLOAD_DIR, metadata._id + path.extname(name));
            fs.renameSync(oldPath, newPath);

            await db.Videos.create({
                _id: metadata._id,
                title: body.title,
                description: body.description,
                genres,
                tags: body.tags.split(',').map(tag => tag.trim()),
                channel: context.info.channel._id,
            });

            context.queue.enqueue(process.env.TRANSCODE_QUEUE, {name: path.basename(newPath)});
        }
    };

    /**
     * @param {import('./upload.d').Context} context
     */
    response.validate = async (context) => {
        const body = context.fields;
        if (!body.token) {
            throw new Error('Please supply a valid token');
        }
        if (!body.channel) {
            throw new Error('Please supply a channel id');
        }

        const user = await utils.Auth.getUserFromToken(body.token);
        const db = await DB.init();
        const channel = await db.Channels.findOne({
            _id: body.channel,
            user: user.id
        });

        if (!channel) {
            throw new Error('No channel found associated with user');
        }

        context.info = {user, channel};
    };

    return response;
};

module.exports = ns;