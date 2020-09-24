<template>
  <v-container>
    <v-row>
      <div class="text-body-1">Trending</div>
    </v-row>
    <v-row class="pt-2">
      <video-thumbs :videos="videos" horizontal :loading="false"></video-thumbs>
    </v-row>
  </v-container>
</template>

<script>
export default {
  async asyncData({ $sdk, error }) {
    const trending = await $sdk.Metadata.getTrendingVideos()

    if (trending.error) {
      return error({
        statusCode: 500,
        message: trending.error,
      })
    }

    return {
      videos: trending.result,
    }
  },
}
</script>
