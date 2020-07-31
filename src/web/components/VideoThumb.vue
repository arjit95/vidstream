<template>
  <div class="d-inline-flex flex-row" style="width: auto;">
    <v-avatar class="video-thumb">
      <v-img :src="video.thumb"></v-img>
    </v-avatar>
    <div class="flex-column ms-3">
      <div class="text-subtitle-2">
        <nuxt-link :to="video.url">{{ video.name }}</nuxt-link>
      </div>
      <div class="text-caption">{{ video.channel }}</div>
      <div class="text-caption">
        {{ video.views }} views | {{ video.uploadedDate }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.video-thumb {
  width: 150px !important;
  height: 80px !important;
  border-radius: 0;
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
          url: '/watch?vi=123',
        }
      },
    },
  },
}
</script>
