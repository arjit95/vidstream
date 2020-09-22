import { ElasticObj } from '@me/common/metrics';
import { getInstance } from '@me/common/metrics/adapter';
import {
  SearchResponse,
  SearchSuggestion,
  SearchResult,
} from '../types/output';
import { PaginatedInput } from '../types/input';

import { Video, Channel, User } from '@me/common/db/models';
import { Suggesters } from './Suggesters';

type EsResult = {
  _index: string;
  _id: string;
  _source: Video & Channel & User;
};

type SuggestOptions = {
  text: string;
  score: number;
  freq: number;
};

type Suggestions = {
  suggest: {
    [key: string]: [{
      options: Array<SuggestOptions>;
      text: string;
    }];
  };
};

export class Aggregator {
  private static async getCorrectedResponse(
    query: string,
    esObj: ElasticObj
  ): Promise<SearchSuggestion | undefined> {
    const instance = await getInstance();

    const suggestions = [];
    suggestions[0] = instance.search({
      index: esObj.Videos.index,
      body: {
        suggest: {
          text: query,
          ...Suggesters.Video.phrases,
          ...Suggesters.Video.suggesters,
        },
      },
    });

    suggestions[1] = instance.search({
      index: esObj.Users.index,
      body: {
        suggest: {
          text: query,
          ...Suggesters.User.phrases,
        },
      },
    });

    suggestions[2] = instance.search({
      index: esObj.Channels.index,
      body: {
        suggest: {
          text: query,
          ...Suggesters.Channel.phrases,
          ...Suggesters.Channel.suggeters,
        },
      },
    });

    const results = await Promise.all(suggestions);

    const options = results.reduce((acc: Array<SuggestOptions>, result) => {
      const body = result.body as Suggestions;
      const options = Object.values(body.suggest)
        .flat()
        .flatMap(({ options }) => options)

      return acc.concat(options);
    }, []);

    let max = options[0];
    for (let option of options) {
      if (max.score < option.score) {
        max = option;
      }
    }

    if (max) {
      const suggestion = new SearchSuggestion();
      suggestion.query = max.text;
      return suggestion;
    }

    return undefined;
  }

  static async search(
    query: string,
    esObj: ElasticObj,
    pagination: PaginatedInput
  ): Promise<SearchResponse> {
    const instance = await getInstance();
    const index = [
      esObj.Channels.index,
      esObj.Users.index,
      esObj.Videos.index,
    ].join(',');

    const results = await instance.search({
      index,
      from: pagination.skip,
      size: pagination.take,
      body: {
        query: {
          multi_match: {
            query,
            type: 'bool_prefix',
            fields: [
              'title',
              'name',
              'genres.raw',
              'tags.raw',
              'description',
              'username',
            ],
          },
        },
      },
    });

    const response = new SearchResponse();
    if (results.body.hits.hits.length === 0) {
      response.results = [];
      response.suggestion = await Aggregator.getCorrectedResponse(query, esObj);
    } else {
      response.results = results.body.hits.hits.map((hit: EsResult) => {
        const result = new SearchResult();
        result.type = hit._index.substring(0, hit._index.length - 1);
        result.title = hit._source.title || hit._source.name || hit._source.username;
        result.id = hit._id;
        result.subtitle = hit._source.description || hit._source.username;
        return result;
      });
    }

    return response;
  }
}
