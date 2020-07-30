<template>
  <v-container fluid>
    <video-player
      ref="videoPlayer"
      :on-ready="onVideoPlayerReady"
      :options="videoPlayerOptions"
    ></video-player>
    <v-row class="flex-sm-row-reverse flex-md-row">
      <v-col sm="12" md="9">
        <v-card>
          <v-tabs v-model="tab" color="primary accent-4" centered>
            <v-tab>Description</v-tab>
            <v-tab>Comments</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <v-container fluid>
                <v-row>
                  Some random description content for vue
                </v-row>
              </v-container>
            </v-tab-item>
            <v-tab-item>
              <v-container fluid>
                <v-row>
                  Some random comment content for vue
                </v-row>
              </v-container>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
      <v-col sm="12" md="3">
        <p class="text-subtitle-1 ms-0">Recommended</p>
        <video-thumb></video-thumb>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VideoPlayer from '~/components/VideoPlayer'
import VideoThumb from '~/components/VideoThumb'

export default {
  name: 'Watch',
  components: {
    VideoPlayer,
    VideoThumb,
  },
  data() {
    return {
      tab: null,
      videoPlayerOptions: {
        html5: {
          vhs: {
            overrideNative: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
      },
      onVideoPlayerReady(player) {
        player.src({
          src:
            'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
          type: 'application/x-mpegURL',
        })
      },
    }
  },
  created() {
    const vi = this.$route.query.vi
    if (!vi) {
      return this.$router.push('/')
    }
  },
}
</script>
