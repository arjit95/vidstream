<template>
  <v-container fluid>
    <video-player
      ref="videoPlayer"
      :on-ready="onVideoPlayerReady"
      :options="videoPlayerOptions"
      :video-info="videoInfo"
      @like="onVideoLike"
      @end="onVideoEnd"
    ></video-player>
    <v-row class="flex-row">
      <v-col cols="12">
        <v-expansion-panels flat :value="0">
          <!-- Disabled, until we get playlists !-->
          <v-expansion-panel v-if="false">
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
              <video-description :video-info="videoInfo"></video-description>
            </v-tab-item>
            <v-tab-item>
              <v-container>
                <comment-box :thumb="userProfile" @commentAdd="onCommentAdd" />
                <comment
                  v-for="comment in comments"
                  :key="comment.id"
                  :comment="comment"
                  @commentAdd="onCommentAdd"
                  @commentRequest="onCommentRequest"
                  @like="onCommentLike"
                />
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
        <video-thumbs
          vertical
          :videos="related"
          :loading="related.length > 0"
        ></video-thumbs>
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
import CommentBox from '~/components/CommentBox'

export default {
  name: 'Watch',
  components: {
    VideoPlayer,
    VideoThumbs,
    Comment,
    VideoDescription,
    CommentBox,
  },

  async asyncData({ $sdk, params, error }) {
    const videoInfo = await $sdk.Video.getInfo(params.vi)
    if (videoInfo.error) {
      return error({ statusCode: 404, message: 'This video is unavailable.' })
    }
    const related = await $sdk.Recommendations.getRelatedVideos(params.vi)
    if (related.error) {
      return error({
        statusCode: 500,
        message: 'Error while fetching related videos',
      })
    }

    return {
      videoInfo,
      related: related.result,
    }
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
      comments: [],
      commentsLoaded: false,

      onVideoPlayerReady(player) {
        const vi = this.videoInfo.id
        const apiURL = this.$config.apiURL

        player.poster(`${apiURL}/api/assets/video/image/${vi}/poster.png`)
        player.src({
          src: `${apiURL}/api/assets/video?stream=${vi}/video.m3u8`,
          type: 'application/x-mpegURL',
        })

        player.vttThumbnails({
          src: `${apiURL}/api/assets/video/image/${vi}/thumb.vtt`,
        })
      },
    }
  },

  computed: {
    userProfile() {
      return this.$store.state.app.userInfo.username
    },
  },

  middleware({ route, error }) {
    const { vi } = route.params
    if (!vi) {
      return error({ statusCode: 404, message: 'This video is unavailable.' })
    }
  },
  methods: {
    onVideoEnd({ duration, videoDuration }) {
      if (
        (isNaN(duration) || isNaN(videoDuration)) &&
        !(duration && videoDuration)
      ) {
        return
      }

      const timeWatched = duration / videoDuration
      // TODO: Move to server.
      if (timeWatched < 0.2) return

      this.$sdk.Recommendations.addRecommendation(
        this.videoInfo.id,
        timeWatched
      )
    },

    async getComments(id) {
      const comments = await this.$sdk.Metadata.getComments(
        this.videoInfo.id,
        id
      )

      if (comments.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: comments.error,
        })

        return null
      }

      comments.result = comments.result.map((comment) => {
        comment.children = undefined
        comment.showReplies = false
        return comment
      })

      return comments
    },

    async loadComments() {
      if (this.commentsLoaded) {
        return
      }

      const comments = await this.getComments()
      if (!comments) {
        return
      }

      this.commentsLoaded = true
      this.comments = comments.result
    },

    loadContent(num) {
      switch (num) {
        case 1:
          this.loadComments()
          break
      }
    },

    async onVideoLike(liked) {
      const response = await this.$sdk.Metadata.likeVideo(
        this.videoInfo.id,
        liked
      )

      if (response?.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      }
    },

    async onCommentLike(info) {
      const response = await this.$sdk.Metadata.likeComment(info.id, info.state)

      if (response?.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      }
    },

    async onCommentRequest(id) {
      const comment = this.comments.find((comment) => comment.id === id)
      if (!comment) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: 'Oops something went wrong',
        })

        return
      }

      const comments = await this.getComments(comment.id)

      if (!comments) {
        return
      }

      comment.children = comments.result.length ? comments.result : null
    },

    async onCommentAdd(info) {
      if (!info.value) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: 'Please enter a value',
        })
      }

      const response = await this.$sdk.Metadata.addComment(
        this.videoInfo.id,
        info.value,
        info.id
      )

      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
        return
      }

      response.children = undefined
      response.showReplies = false

      if (info.id) {
        const comment = this.comments.find(({ id }) => id === info.id)

        // Load comments if they are not already loaded
        if (comment.children === undefined) {
          await this.onCommentRequest(info.id)
        } else {
          comment.children = comment.children || []
          comment.children.unshift(response)
        }

        comment.showReplies = true
      } else {
        this.comments.unshift(response)
      }
    },
  },
}
</script>
