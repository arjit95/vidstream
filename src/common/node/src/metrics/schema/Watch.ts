export const WatchSchema = {
  mappings: {
    properties: {
      username: {
        type: 'text',
      },
      video_id: {
        type: 'text',
      },
      rating: {
        type: 'double',
        index: false,
      },
      duration: {
        type: 'double',
        index: false,
      },
    },
  },
};
