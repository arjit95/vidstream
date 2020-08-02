<template>
  <v-container fluid>
    <video-player
      ref="videoPlayer"
      :on-ready="onVideoPlayerReady"
      :options="videoPlayerOptions"
    ></video-player>
    <v-row class="flex-row">
      <v-col cols="12">
        <v-expansion-panels flat :value="0">
          <v-expansion-panel>
            <v-expansion-panel-header>
              <p class="text-subtitle-1">Up Next</p>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <video-thumbs horizontal :videos="next" dense></video-thumbs>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row class="flex-sm-column-reverse flex-md-row">
      <v-col sm="12" md="8">
        <v-card>
          <v-tabs v-model="tab" color="accent-4" centered @change="loadContent">
            <v-tab>Description</v-tab>
            <v-tab>Comments</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item>
              <video-description></video-description>
            </v-tab-item>
            <v-tab-item>
              <v-container fluid>
                <comment
                  v-for="comment in comments"
                  :key="comment.url"
                  :comment="comment"
                ></comment>
                <v-row v-show="!commentsLoaded" justify="center" align="center">
                  <v-skeleton-loader
                    :loading="!commentsLoaded"
                    type="list-item-avatar-two-line"
                    min-width="80%"
                  >
                  </v-skeleton-loader>
                </v-row>
              </v-container>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
      <v-col sm="12" md="4">
        <p class="text-subtitle-1 ms-0">Related</p>
        <video-thumbs vertical :videos="related"></video-thumbs>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.next .thumb:not(:first-of-type) {
  padding-left: 16px;
}
</style>
<script>
import VideoPlayer from '~/components/VideoPlayer'
import VideoThumbs from '~/components/VideoThumbs'
import Comment from '~/components/Comment'
import VideoDescription from '~/components/VideoDescription'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
  name: 'Watch',
  components: {
    VideoPlayer,
    VideoThumbs,
    Comment,
    VideoDescription,
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
      next: [],
      related: [],
      comments: [],
      commentsLoaded: false,
      async onVideoPlayerReady(player) {
        await wait(2000)
        player.src({
          src:
            'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
          type: 'application/x-mpegURL',
        })
      },
    }
  },

  async mounted() {
    const videos = {
      name: 'Video 1',
      channel: 'Channel 1',
      views: 1235,
      uploadedDate: '4 days ago',
      thumb: 'https://cdn.vuetifyjs.com/images/cards/store.jpg',
      url: '/watch/123',
      channelThumb: 'https://cdn.vuetifyjs.com/images/cards/store.jpg',
      channelURL: '/channel/123',
    }

    await wait(5000)

    this.next = Array(5).fill(videos)
    this.related = this.next
  },

  middleware({ route, error }) {
    const { vi } = route.params
    if (!vi) {
      return error({ statusCode: 404, message: 'This video is unavailable.' })
    }
  },

  methods: {
    loadDescription() {},

    async loadComments() {
      const content = {
        channel: 'Channel name',
        profileURL: '/profile?id=1234',
        profile: 'User 1',
        url: '/watch/123?comment=1234',
        date: '4 days ago',
        content:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        thumb: 'https://cdn.vuetifyjs.com/images/cards/store.jpg',
        children: [],
      }

      await wait(3000)
      this.comments.push(...Array(5).fill(content))
      this.commentsLoaded = true
    },

    loadContent(num) {
      switch (num) {
        case 0:
          this.loadDescription()
          break
        case 1:
          this.loadComments()
          break
      }
    },
  },
}
</script>
