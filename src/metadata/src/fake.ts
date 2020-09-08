import Faker from 'faker';
import { Common } from '@me/common/utils/common';
import { User, Channel, Video } from '@me/common/db/models';

const NUM_USERS = 10;
const users: User[] = [];
const channels: Channel[] = [];
const videos: Video[] = [];

for (let i = 0; i < NUM_USERS; i++) {
  const user = new User();
  user.username = Faker.internet.userName();
  user.name = Faker.name.firstName();
  user.password = Faker.internet.password();
  user.email = Faker.internet.email();
  user.description = Faker.lorem.paragraph();
  users.push(user);
}

for (let i = 0; i < NUM_USERS * 2; i++) {
  const idx = Math.floor(i / 2);
  const user = users[idx];
  const channel = new Channel();
  channel.id = Common.generateUniqueId(`${user.username}:${i % 2}`);
  channel.title = Faker.name.title();
  channel.user = user;
  channel.video_count = 1;
  channel.description = Faker.lorem.paragraph();
  channels.push(channel);
}

for (let i = 0; i < channels.length; i++) {
  const idx = i % 2;
  const video = new Video();
  const channel = channels[i];
  video.id = Common.generateUniqueId(
    `${channel.user.username}:${channel.video_count}:${idx}`
  );
  video.title = Faker.name.title();
  video.description = Faker.lorem.paragraphs();
  video.channel = channel;
  video.user = channel.user;
  video.listing = 0;
  video.tags = [];
  video.genres = [];

  videos.push(video);
}

export default async function() {
  await User.save(users);
  await Channel.save(channels);
  await Video.save(videos);
}
