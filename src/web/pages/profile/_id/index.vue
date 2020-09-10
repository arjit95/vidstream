<template>
  <v-container class="pt-0" fluid>
    <banner></banner>
    <v-container>
      <div class="channel-header text-body-1 mb-6">Recently Uploaded</div>
      <video-thumbs
        :videos="videos"
        :loading="loading"
        horizontal
      ></video-thumbs>
    </v-container>
  </v-container>
</template>

<script>
import Humanize from 'humanize-duration'
import VideoThumbs from '~/components/VideoThumbs'
import Banner from '~/components/Banner'

export default {
  name: 'UserProfile',
  components: { VideoThumbs, Banner },
  data() {
    return {
      videos: [],
      loading: true,
      username: this.$route.params.id,
    }
  },
  beforeCreate() {
    if (!this.$route.params.id) {
      this.$router.push('404')
    }
  },

  mounted() {
    this.init()
  },
  methods: {
    async init() {
      const username = this.$route.params.id
      const response = await this.$sdk.Metadata.getUserVideos(null, username)
      if (response.error) {
        return this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      }

      const API_URL = this.$config.apiURL
      this.videos = response.result.map((video) => ({
        name: video.title,
        channel: video.channel.title,
        views: video.views,
        uploadedDate:
          Humanize(Date.now() - new Date(video.uploaded_at).getTime(), {
            largest: 1,
          }) + ' ago',
        thumb: `${API_URL}/api/assets/video/image/${video.id}/poster.png`,
        channelThumb: 'https://cdn.vuetifyjs.com/images/cards/store.jpg',
        url: `/watch/${video.id}`,
        channelURL: `/channel/${video.channel.id}`,
      }))

      this.loading = false
    },
  },
}
</script>
