export const ChannelSchema = {
  settings: {
    index: {
      analysis: {
        analyzer: {
          trigram: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'shingle'],
          },
        },
        filter: {
          shingle: {
            type: 'shingle',
            min_shingle_size: 2,
            max_shingle_size: 3,
          },
        },
      },
    },
  },
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
      description: {
        type: 'text',
      },
    },
  },
};
