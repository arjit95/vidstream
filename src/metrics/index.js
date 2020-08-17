const express = require('express');
const logger = require('fluent-logger');
const Metrics = require('../common/node/metrics');
const Db = require('../common/node/db');

const genreMultiplier = {
    'entertainment': 0.1,
    'technology': 0.2
};

/**
 * @type {Metrics.ElasticObj}
 */
let metrics;

/**
 * @type {Db.DBObj}
 */
let db;
const app = express();

const WATCH_THRESHOLD = 0.2; // At least 40% video is watched
const u = new URL(process.env.LOGGER_SERVICE_ADDR);

logger.configure('metrics_service', {
  host: u.hostname,
  port: u.port,
  timeout: 3.0,
  reconnectInterval: 600000
});

app.use(express.json());

app.get('/_healthz', (req, res) => {
    res.send('ok');
});

app.post('/api/metrics/watch', async (req, res) => {
    const userID = req.body.userID;
    const videoID = req.body.videoID;
    let existingEntry = {response: null};
    try {
        existingEntry = await metrics.Watch.get(`${userID}:${videoID}`);
    } catch(err) {}

    const lastEntry = await metrics.Watch.search({
        query: { match: {user_id: userId} },
        sort: { "@timestamp" : "desc" },
        size: 1
    });

    const videoEntry = await db.Videos.findOne({id: videoID});

    // Basic spam detection
    if (lastEntry.response?.length) {
        const [entry] = lastEntry.response;
        const lastEntryTs = new Date(entry._source['@timestamp']);
        const diff = lastEntryTs.getTime() - timestamp.getTime();
        if (diff < duration * WATCH_THRESHOLD) {
            return res.status(406).end();
        }
    }

    const source = existingDoc.body;
    const entryTs = new Date(source['@timestamp']);
    const diff = entryTs.getTime() - timestamp.getTime();
    if (diff < duration * WATCH_THRESHOLD) {
        return res.status(406).end();
    }

    const payload = existingEntry.response || {user_id: userID, video_id: videoID, id: `${userID}:${videoID}`};
    if (payload.rating >= 0.5) {
        return res.end();
    }
    
    const multipliers = videoEntry.genres.map(genre => genreMultiplier[genre]);
    const multiplier = Math.min.apply(null, ...multipliers);
    const rating = typeof payload.rating === 'number' ? Math.min(payload.rating * multiplier, 0.5) : multiplier;

    logger.emit('watch', { user_id: userID, video_id: videoID, id: `${userID}:${videoID}`, rating });
    res.end();
});

async function start() {
    metrics = await Metrics.init();
    db = await Db.init();
    app.listen(process.env.PORT, '0.0.0.0');    
}

start()
    .then(() => {
        console.log('Metrics service is running');
    })
    .catch((err) => {
        console.error('Cannot start metrics service');
        console.error(JSON.stringify(err, null, 4));
        process.exit(1);
    });
