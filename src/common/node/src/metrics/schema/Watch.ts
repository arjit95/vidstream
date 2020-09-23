export const WatchSchema = {
  mappings: {
    properties: {
      username: {
        type: 'text',
      },
      video_id: {
        type: 'text',
      },
      duration: {
        type: 'double',
        index: false,
      },
    },
  },
};
