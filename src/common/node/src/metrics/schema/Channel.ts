export const ChannelSchema = {
  mappings: {
    properties: {
      title: {
        type: 'search_as_you_type',
      },
      user_id: {
        type: 'keyword',
      },
      description: {
        type: 'text',
      }
    },
  },
};
