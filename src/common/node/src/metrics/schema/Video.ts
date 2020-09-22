import { ChannelSchema } from './Channel';

export const VideoSchema = {
  ...ChannelSchema,
  mappings: {
    properties: {
      title: {
        type: 'text',
        fields: {
          trigram: {
            type: 'text',
            analyzer: 'trigram',
          },
        },
      },
      username: {
        type: 'keyword',
      },
      genres: {
        type: 'text',
        fields: {
          raw: {
            type: 'text',
            analyzer: 'keyword',
            term_vector: 'yes',
          },
        },
      },
      description: {
        type: 'text',
      },
      tags: {
        type: 'text',
        fields: {
          raw: {
            type: 'text',
            analyzer: 'keyword',
            term_vector: 'yes',
          },
        },
      },
      channel_id: {
        type: 'text',
      },
      model_factor: {
        type: 'dense_vector',
        dims: 20,
      },
      model_version: {
        type: 'keyword',
        index: false,
      },
      model_timestamp: {
        type: 'date',
        index: false,
      },
    },
  },
};
