<template>
  <div :class="containerClass">
    <nuxt-link :to="url">
      <v-avatar :class="dense ? 'video-thumb dense' : 'video-thumb'">
        <v-img :src="thumb"></v-img>
      </v-avatar>
    </nuxt-link>
    <div class="info-container">
      <v-col v-if="horizontal" cols="3">
        <nuxt-link :to="channelURL">
          <text-avatar
            :profile="channelThumb"
            :name="video.channel.title"
            class="mt-2"
            :size="42"
          />
        </nuxt-link>
      </v-col>
      <v-col cols="9" :class="videoInfoClass">
        <div class="text-subtitle-2 video-title">
          <nuxt-link :to="url" :title="video.title">{{
            video.title
          }}</nuxt-link>
        </div>
        <div class="text-caption">
          <nuxt-link :to="channelURL">{{ video.channel.title }}</nuxt-link>
        </div>
        <div class="text-caption">{{ videoViews }} | {{ uploadedDate }}</div>
      </v-col>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.thumb-container.flex-row {
  .video-thumb {
    width: 150px !important;
    height: 80px !important;
    border-radius: 0;
  }

  .video-thumb.dense {
    height: 40px;
  }

  .info-container {
    max-width: 80%;
  }
}

.thumb-container.flex-column {
  .video-thumb {
    width: 100% !important;
    height: 160px !important;
    border-radius: 0;
  }

  .info-container {
    max-width: 100%;
    display: flex;
  }
}

.info-container {
  .video-title {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .video-info {
    overflow: hidden;
  }
}
</style>
<script>
import Humanize from 'humanize-duration'
import TextAvatar from '~/components/TextAvatar'
export default {
  name: 'VideoThumb',
  components: { TextAvatar },
  props: {
    video: {
      type: Object,
      default: () => {
        return {
          title: 'Video name',
          channel: {
            title: 'Channel name',
            id: '',
          },
          views: 0,
          uploaded_at: new Date(),
        }
      },
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    videoInfoClass() {
      return 'video-info pr-0 ' + (this.horizontal ? '' : 'pt-0 ms-2')
    },

    containerClass() {
      return `d-inline-flex thumb-container ${
        this.horizontal ? 'flex-column' : 'flex-row'
      }`
    },
    thumb() {
      return `${this.$config.apiURL}/api/assets/video/image/${this.video.id}/poster.png`
    },
    channelThumb() {
      return `${this.$config.apiURL}/api/assets/channel?id=${this.video.channel.id}.png`
    },
    url() {
      return `/watch/${this.video.id}`
    },
    channelURL() {
      return `/channel/${this.video.channel.id}`
    },
    uploadedDate() {
      return (
        Humanize(Date.now() - new Date(this.video.uploaded_at).getTime(), {
          largest: 1,
        }) + ' ago'
      )
    },
    videoViews() {
      return this.$sdk.Utils.pluralize(this.video.views, 'View')
    },
  },
}
</script>
