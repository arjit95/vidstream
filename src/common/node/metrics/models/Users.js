const {Client} = require('@elastic/elasticsearch');
const Schema = require('../schema/User');
const Model = require('./Model');
const utils = require('../../utils');

/**
 * Allows to manage User index in elasticsearch database 
 * @class
 * @classdesc Manages users index in elasticsearch
 */
class Users extends Model {
    /**
     * @constructor
     * @param {Client} client 
     */
    constructor(client) {
        super(client);
        this.index = 'users';
        this.schema = Schema;
    }

    /**
     * Creates a new user in the index
     * @param {object} userInfo
     * @param {string} userInfo.name Name of the user
     * @param {string} userInfo.username Username for the user
     */
    async create(userInfo) {
        const response = await this.client.create({
            index: this.index,
            id: utils.Common.generateUniqueId(),
            body: {
                username: userInfo.username,
                name: userInfo.name
            },
        });

        this._throwErrorIfFailed(response);
        const metadata = response.body;
        return {metadata, response: null};
    }
}

module.exports = Users;