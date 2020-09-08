import express from 'express';
import logger from 'fluent-logger';
import { Metrics, ElasticObj } from '@me/common/metrics';
import { Video } from '@me/common/db/models/Video';
import { Adapter as DBAdapter } from '@me/common/db/adapter';

const genreMultiplier: { [key: string]: number } = {
  entertainment: 0.1,
  technology: 0.2,
};

let metrics: ElasticObj;
const app = express();

const WATCH_THRESHOLD = 0.3; // At least 30% video is watched
const u = new URL(process.env.CONFIG_LOGGER_SERVICE);

logger.configure('metrics_service', {
  host: u.hostname,
  port: parseInt(u.port),
  timeout: 3.0,
  reconnectInterval: 600000,
});

app.use(express.json());

app.get('/_healthz', (req, res) => {
  res.send('ok');
});

app.post('/api/metrics/watch', async (req, res) => {
  const username = req.body.username;
  const videoID = req.body.videoID;
  const duration = req.body.duration;

  let existingEntry;
  try {
    existingEntry = await metrics.Watch.get(`${username}:${videoID}`);
  } catch (err) {}

  const lastEntry = await metrics.Watch.search({
    query: { match: { username } },
    sort: { '@timestamp': 'desc' },
    size: 1,
  });

  const videoEntry = await Video.findOne({ id: videoID });
  const timestamp = new Date();

  // Basic spam detection
  if (lastEntry.response?.length) {
    const [entry] = lastEntry.response;
    const lastEntryTs = new Date(entry._source['@timestamp']);
    const diff = lastEntryTs.getTime() - timestamp.getTime();
    if (diff < duration * WATCH_THRESHOLD) {
      return res.status(406).end();
    }
  }

  const payload = existingEntry?.response || {
    username,
    video_id: videoID,
    id: `${username}:${videoID}`,
  };
  if (payload.rating >= 0.5) {
    return res.end();
  }

  const multipliers =
    videoEntry?.genres?.map(genre => {
      if (genre in genreMultiplier) {
        return genreMultiplier[genre];
      }

      return 0.1;
    }) || [];

  const multiplier = Math.min.apply(null, multipliers);
  const rating =
    typeof payload.rating === 'number'
      ? Math.min(payload.rating + multiplier, 0.5)
      : multiplier;

  logger.emit('watch', {
    username,
    video_id: videoID,
    id: `${username}:${videoID}`,
    rating,
  });
  res.end();
});

async function start() {
  metrics = await Metrics.getInstance();
  await DBAdapter.createConnection();
  app.listen(parseInt(process.env.CONFIG_HTTP_PORT), '0.0.0.0');
}

start()
  .then(() => {
    console.log('Metrics service is running');
  })
  .catch(err => {
    console.error('Cannot start metrics service');
    console.log(err.stack);
    console.error(JSON.stringify(err, null, 4));
    process.exit(1);
  });
