const {Client} = require('@elastic/elasticsearch');

class Model {
    /** 
     * @param {Client} client 
     */
    constructor(client) {
        this.client = client;
        this.index = null;
        this.schema = null;
    }

    _throwErrorIfFailed(response) {
        if (response.statusCode > 400) {
            console.log(`Error occurred while completing your es request: ${response.body}` );
            throw new Error('Cannot complete your request, please try again later');
        }

        return null;
    }

    /**
     * Check if elasticsearch table exists or not
     * @returns {Promise<boolean>} true if table is present
     */
    async isTablePresent() {
        const response = await this.client.indices.exists({
            index: this.index
        });

        this._throwErrorIfFailed(response);
        return true;
    }

    /**
     * Creates an index in elasticsearch
     * @returns {Promise<boolean>} true if the table is created
     */
    async createTable() {
        const response = await this.client.indices.create({
            index: this.index,
            body: this.schema
        });

        this._throwErrorIfFailed(response);
        return true;
    }

    /**
     * Deletes the users index in elasticsearch
     * @returns {Promise<boolean>} true if table is deleted
     */
    async deleteTable() {
        const response = await this.client.indices.delete({
            index: this.index
        });

        this._throwErrorIfFailed(response);
        return true;
    }

    async exists(id) {
        return !!(await this.get(id));
    }

    /**
     * Gets item from index
     * @param {string} id id which needs to be checked
     */
    async get(id) {
        const response = await this.client.get({
            index: this.index,
            id
        });

        this._throwErrorIfFailed(response);
        const {metadata, ..._source} = response.body;
        return {metadata, response: _source};
    }

    /**
     * Performs a search query on the elasticsearch index
     * @param {object} body Query for elasticsearch 
     */
    async search(body) {
        const response = await this.client.search({
            index: this.index,
            body
        });

        this._throwErrorIfFailed(response);
        const {metadata, ...hits} = response;
        return {metadata, response: hits.hits};
    }

    /**
     * Deletes document from the table
     * @param {string} id User id to be removed 
     */
    async delete(id) {
        const response = await this.client.delete({
            index: this.index,
            id
        });

        this._throwErrorIfFailed(response);
        return true;
    }
}

module.exports = Model;