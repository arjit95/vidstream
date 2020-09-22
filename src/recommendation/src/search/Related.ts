import { ElasticObj } from '@me/common/metrics';
import { getInstance } from '@me/common/metrics/adapter';
import { Videos } from '../types/output';
import { PaginatedInput } from '../types/input';
import { Video } from '@me/common/db/models/Video';
import { IdGen } from '@me/common/utils/IdGen';

type VideoResult = {
  _index: string;
  _id: string;
  _source: Video;
};

type VideoHits = {
  total: {
    value: number;
    relation: string;
  };
  hits: Array<VideoResult>;
};

export class Related {
  static async getRelatedVideos(
    videoId: string,
    pagination: PaginatedInput,
    esObj: ElasticObj
  ): Promise<Videos> {
    const instance = await getInstance();

    const results = await instance.search({
      from: pagination.skip,
      size: pagination.take,
      index: esObj.Videos.index,
      body: {
        query: {
          more_like_this: {
            fields: [
              'title^3',
              'name^3',
              'genres.raw',
              'tags.raw',
              'description',
              'username^5',
            ],
            like: [
              {
                _id: videoId,
                _index: esObj.Videos.index,
              },
            ],
            min_term_freq: 1,
            min_doc_freq: 1,
          },
        },
      },
    });

    const hits: VideoHits = results.body.hits;
    const videoIds = results.body.hits.hits.map((hit: VideoResult) => {
      const id = hit._id;
      const username = IdGen.decode(id).split('-')[0];
      return { id, user: { username } };
    });

    const total = hits.total.value;
    const videos = await Video.find({
      where: videoIds,
      take: total,
    });

    const response = new Videos();
    response.total = total;
    response.result = videos;
    return response;
  }
}
