const router = require('express').Router();
const adapter = require('../common/node/db');
const utils = require('../common/node/utils');

/**
 * Get list of user subscriptions
 * TODO
 */
router.post('/subscriptions', function(req, res) {
    res.end();
});

/**
 * Get list of user videos
 * TODO
 */
router.post('/videos', function(req, res) {
    res.end();
});

/**
 * Get list of user channels
 */
router.post('/channels', async function(req, res) {
    try {
        if (!req.body.token) {
            throw new Error('Please supply a user token');
        }

        const response = await utils.Auth.getUserFromToken(req.body.token);
        const db = await adapter.init();
        const channels = await db.Channels.find({user: response.id});
        return res.status(200).json({
            result: channels.map(channel => ({title: channel.title, id: channel._id}))
        });
    } catch(err) {
        console.error(err.stack);
        res.status(500).json({error: err.message});
    }
});

/**
 * Get user relation to a specific video
 * Includes: likes etc
 * TODO
 */
router.post('/video', function(req, res) {
    res.end();
});

module.exports = router;