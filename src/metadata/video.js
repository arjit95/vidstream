const router = require('express').Router();
const Database = require('../common/node/db');
const utils = require('../common/node/utils');

router.post('/info/:id', async function(req, res) {
    try {
        const db = await Database.init()
        const video = await db.Videos.findById(req.params.id);
        if (!video) {
            return res.status(404).json({error: 'Cannot find video for the given id'}).end();
        }

        const authorizedUser = req.body.token ? await utils.Auth.getUserFromToken(req.body.token) : null;
        if (video.listing === 'private'
            && (!authorizedUser || authorizedUser?.id !== video.user)) {

            return res.status(401).json({error: 'Unauthorized to watch this video'});
        }

        const channel = await db.Channels.findById(video.channel);
        const user = await db.Users.findById(channel.user);
        let self = {};
        if (authorizedUser) { // TODO: Fetch like/subscribe
            
        }

        return res.status(200).json({
           video: {
                title: video.title,
                description: video.description,
                genres: video.genres,
                tags: video.tags,
                views: video.views
           },
           channel: {
               title: channel.title,
               id: channel._id,
               subscribers: channel.subscribers
           },
           user: {
                id: user._id,
                name: user.name,
                username: user.username
           },
           self: {
                hasLiked: false,
                hasSubscribed: false,
           }
        });
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
});

module.exports = router;