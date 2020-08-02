<template>
  <div :class="containerClass">
    <nuxt-link :to="video.url">
      <v-avatar :class="dense ? 'video-thumb dense' : 'video-thumb'">
        <v-img :src="video.thumb"></v-img>
      </v-avatar>
    </nuxt-link>
    <v-row>
      <nuxt-link :to="video.channelURL">
        <v-avatar v-if="horizontal" class="mt-4 ml-4">
          <v-img :src="video.channelThumb"></v-img>
        </v-avatar>
      </nuxt-link>
      <v-col :class="vertical ? 'pt-0 ml-4' : ''">
        <div class="text-subtitle-2">
          <nuxt-link :to="video.url">{{ video.name }}</nuxt-link>
        </div>
        <div class="text-caption">
          <nuxt-link :to="video.channelURL">{{ video.channel }}</nuxt-link>
        </div>
        <div class="text-caption">
          {{ video.views }} views | {{ video.uploadedDate }}
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
export default {
  name: 'VideoThumb',
  props: {
    video: {
      type: Object,
      default: () => {
        return {
          name: 'Video name',
          channel: 'Channel name',
          views: 1234,
          uploadedDate: '4 days ago',
          thumb: 'https://cdn.vuetifyjs.com/images/cards/store.jpg',
          channelThumb: 'https://cdn.vuetifyjs.com/images/cards/store.jpg',
          channelURL: '/channel/123',
          url: '/watch/123',
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
  },
}
</script>
