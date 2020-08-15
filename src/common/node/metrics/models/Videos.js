const {Client} = require('@elastic/elasticsearch');
const Schema = require('../schema/Video');
const Model = require('./Model');

/**
 * Allows to manage Videos index in elasticsearch database 
 * @class
 * @classdesc Manages videos index in elasticsearch
 */
class Videos extends Model {
    /**
     * @param {Client} client 
     */
    constructor(client) {
        super(client);
        this.index = 'Videos';
        this.schema = Schema;
    }

    /**
     * Creates a new video in the index
     * @param {object} videoInfo
     * @param {string} videoInfo.title Title of the video
     * @param {Array<string>} videoInfo.genres Each genre to which the video belong
     * @param {string} videoInfo.userID User id generated earlier thorugh elasticsearch
     */
    async create(videoInfo) {
        const response = await this.client.create({
            index: this.index,
            body: {
                title: videoInfo.title,
                genres: videoInfo.genres,
                user_id: videoInfo.userID
            },
        });

        this._throwErrorIfFailed(response);
        const metadata = response.body;
        return {metadata, response: null}
    }
}

module.exports = Videos;