/**
  * Licensed under the Apache License, Version 2.0 (the "License"); you may
  * not use this file except in compliance with the License. You may obtain
  * a copy of the License at
  *
  *      http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
  * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
  * License for the specific language governing permissions and limitations
  * under the License.
*/

/**
 * Most of the code is derived from
 * https://github.com/IBM/elasticsearch-spark-recommender
 */

import { Video } from '@me/common/db/models/Video';
import { ElasticObj } from '@me/common/metrics';
import { getInstance } from '@me/common/metrics/adapter';
import { Videos } from '../types/output';

export class VideoRecommender {
  /**
    Construct an Elasticsearch script score query using `dense_vector` fields
    The script score query takes as parameters the query vector (as an array)

    @param {Array} queryVector Array The query vector
    @param {string} vectorField The field name in the document against which to score `query_vec`
    @param {string=} q Query string for the search query (default: '*' to search across all documents)
    @param {boolean} cosine Whether to compute cosine similarity. If `False` then the dot product is computed (default: False)        
    
    Note: Elasticsearch cannot rank negative scores. Therefore, in the case of the dot product, a sigmoid transform
    is applied. In the case of cosine similarity, 1.0 is added to the score. In both cases, documents with no 
    factor vectors are ignored by applying a 0.0 score.

    The query vector passed in will be the user factor vector (if generating recommended videos for a user)
    or video factor vector (if generating similar videos for a given video)
  */
  private static vectorQuery(
    queryVector: string,
    vectorField: string,
    q = '*',
    cosine = false
  ) {
    let scoreFn: string;
    if (cosine) {
      scoreFn = `doc['${vectorField}'].size() == 0 ? 0 : cosineSimilarity(params.vector, '${vectorField}') + 1.0`;
    } else {
      scoreFn = `doc['${vectorField}'].size() == 0 ? 0 : sigmoid(1, Math.E, -dotProduct(params.vector, '${vectorField}'))`;
    }

    return {
      query: {
        script_score: {
          query: {
            query_string: {
              query: q,
            },
          },
          script: {
            source: scoreFn,
            params: {
              vector: queryVector,
            },
          },
        },
      },
    };
  }

  /**
     Given a video id, execute the recommendation script score query to find similar videos,
     ranked by cosine similarity. We return the `num` most similar, excluding the videos itself.
    */
  static async getSimilarVideos(
    id: string,
    elasticObj: ElasticObj,
    take = 10,
    skip = 0
  ): Promise<Videos> {
    const instance = await getInstance();
    const { body: response } = await instance.get({
      id,
      index: elasticObj.Videos.index,
    });

    const src = response['_source'];
    const videos = new Videos();

    if ('model_factor' in src) {
      const queryVector = src.model_factor;
      const q = VideoRecommender.vectorQuery(
        queryVector,
        'model_factor',
        '*',
        true
      );
      const { body: results } = await instance.search({
        index: elasticObj.Videos.index,
        body: q,
      });
      const hits = results['hits']['hits'];

      const videoIds = hits
        .slice(skip + 1, take + 1)
        .filter((v: { _id: string } | undefined) => !!v)
        .map((hit: { _id: string }) => {
          return { id: hit._id };
        });

      videos.result = await Video.find({
        where: videoIds,
        take: videoIds.length,
      });

      videos.total = Math.max(0, hits.length - 1);
    }

    videos.result = videos.result || [];
    return videos;
  }

  /**
   * Given a user id, execute the recommendation script score query to find top videos, ranked by predicted rating
   * @param {string} id User id
   * @param {string=} q Elastic search filter query
   * @param {number} take Desired number of results
   * @param {number} skip Number of results to be skipped
   */
  static async getUserRecommendations(
    username: string,
    elasticObj: ElasticObj,
    take = 10,
    skip = 0
  ): Promise<Videos> {
    const instance = await getInstance();

    const { body: response } = await instance.get({
      index: elasticObj.Users.index,
      id: username,
    });
    const src = response['_source'];

    const videos = new Videos();

    if ('model_factor' in src) {
      const queryVec = src.model_factor;
      const q = VideoRecommender.vectorQuery(
        queryVec,
        'model_factor',
        '*',
        false
      );
      const { body: results } = await instance.search({
        index: elasticObj.Videos.index,
        body: q,
      });
      const hits = results['hits']['hits'];
      const videoIds = hits.slice(skip, take).map((hit: { _id: string }) => {
        return { id: hit._id };
      });

      videos.result = await Video.find({
        where: videoIds,
        take: videoIds.length,
      });

      videos.total = hits.length;
    }

    videos.result = videos.result || [];
    return videos;
  }
}
