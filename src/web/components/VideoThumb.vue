<template>
  <div :class="containerClass">
    <nuxt-link :to="url">
      <v-avatar :class="dense ? 'video-thumb dense' : 'video-thumb'">
        <v-img :src="thumb"></v-img>
      </v-avatar>
    </nuxt-link>
    <v-row>
      <nuxt-link :to="channelURL">
        <v-avatar v-if="horizontal" class="mt-4 ml-4">
          <v-img :src="channelThumb"></v-img>
        </v-avatar>
      </nuxt-link>
      <v-col :class="vertical ? 'pt-0 ml-4' : ''">
        <div class="text-subtitle-2">
          <nuxt-link :to="url">{{ video.title }}</nuxt-link>
        </div>
        <div class="text-caption">
          <nuxt-link :to="channelURL">{{ video.channel.title }}</nuxt-link>
        </div>
        <div class="text-caption">
          {{ video.views }} views | {{ uploadedDate }}
        </div>
      </v-col>
    </v-row>
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
}

.thumb-container.flex-column {
  .video-thumb {
    width: 100% !important;
    height: 160px !important;
    border-radius: 0;
  }
}
</style>
<script>
import Humanize from 'humanize-duration'

export default {
  name: 'VideoThumb',
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
    containerClass() {
      return `d-inline-flex thumb-container ${
        this.horizontal ? 'flex-column' : 'flex-row'
      }`
    },
    thumb() {
      return `${this.$config.apiURL}/api/assets/video/image/${this.video.id}/poster.png`
    },
    channelThumb() {
      return `${this.$config.apiURL}/api/assets/channel?id=${this.video.channel.id}`
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
  },
}
</script>
