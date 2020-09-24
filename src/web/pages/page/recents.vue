<template>
  <v-container>
    <div class="text-body-1">Recently Added</div>
    <video-thumbs :videos="videos" horizontal :loading="false"></video-thumbs>
  </v-container>
</template>

<script>
export default {
  async asyncData({ $sdk, error }) {
    const recents = await $sdk.Metadata.getRecentVideos()

    if (recents.error) {
      return error({
        statusCode: 500,
        message: recents.error,
      })
    }

    return {
      videos: recents.result,
    }
  },
}
</script>
