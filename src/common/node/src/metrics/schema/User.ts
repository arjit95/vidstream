import { ChannelSchema } from './Channel';

export const UserSchema = {
  ...ChannelSchema,
  mappings: {
    properties: {
      name: {
        type: 'text',
        fields: {
          trigram: {
            type: 'text',
            analyzer: 'trigram',
          },
        },
      },
      username: {
        type: 'text',
        fields: {
          trigram: {
            type: 'text',
            analyzer: 'trigram',
          },
        },
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
