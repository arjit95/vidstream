import path from 'path';
import fs, { WriteStream } from 'fs';

import { IdGen, Auth } from '@me/common/utils';
import { User, Channel, Video as VideoModel } from '@me/common/db/models';
import { Metrics } from '@me/common/metrics';

import { UploadContext, RequestHandler } from '../../upload_interface';

const UPLOAD_DIR = process.env.CONFIG_UPLOADS_DIRECTORY;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

interface VideoUploadRequest {
  channel: string;
  token: string;
  genres: string;
  title: string;
  description: string;
  tags: string;
}

export class Video implements RequestHandler {
  savedFileName: string | null;
  fileNames: Array<string>;
  User: User | undefined;
  Channel: Channel | undefined;

  constructor() {
    this.savedFileName = null;
    this.fileNames = [];
    this.User = undefined;
    this.Channel = undefined;
  }

  onStream(context: UploadContext): WriteStream | null {
    const filename = context.filename;
    if (!filename) {
      return null;
    }

    if (!(this.Channel && this.User)) {
      throw new Error('Something went wrong please try again');
    }

    const ext = path.extname(filename);

    const generatedFileName: string = `${this.User.username}-${VideoModel.itemType}-${Date.now()}`;
    this.savedFileName = IdGen.encode(generatedFileName);
    this.savedFileName = this.savedFileName + ext;
    this.fileNames.push(this.savedFileName);

    return fs.createWriteStream(path.resolve(UPLOAD_DIR, this.savedFileName));
  }

  async onError(): Promise<void> {
    if (this.savedFileName && fs.existsSync(this.savedFileName)) {
      fs.unlinkSync(this.savedFileName);
    }
  }

  async onFinish(context: UploadContext): Promise<void> {
    const body: VideoUploadRequest = context.fields as VideoUploadRequest;
    const metrics = await Metrics.getInstance();

    if (!(this.Channel && this.User)) {
      throw new Error('Something went wrong please try again');
    }

    for (let name of this.fileNames) {
      const genres = body.genres.split(',').map(genre => genre.trim());
      const id = path.basename(name, path.extname(name))
      await metrics.Videos.create({
        userID: this.User.username,
        genres,
        title: body.title,
        id,
        description: body.description
      });

      const video = new VideoModel();
      video.id = id;
      video.title = body.title;
      video.description = body.description;
      video.genres = genres;
      video.tags = body.tags.split(',').map(tag => tag.trim());
      video.channel = this.Channel;
      video.user = this.User;
      video.listing = 0;

      await video.save();

      context.queue.enqueue(process.env.TRANSCODE_QUEUE, { fileName: name });
    }
  }

  async validate(context: UploadContext): Promise<void> {
    const body: VideoUploadRequest = context.fields as VideoUploadRequest;
    if (!body.token) {
      throw new Error('Please supply a valid token');
    }

    if (!body.channel) {
      throw new Error('Please supply a channel id');
    }

    const { username } = await Auth.getUserFromToken(body.token);

    this.User = await User.findOne({
      username: username,
    });

    if (typeof this.User === 'undefined') {
      throw new Error('No user found for this username');
    }

    this.Channel = await Channel.findOne({
      id: body.channel,
      user: this.User,
    });

    if (typeof this.Channel === 'undefined') {
      throw new Error('No channel found associated with user');
    }
  }
}
