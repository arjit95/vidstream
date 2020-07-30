<template>
  <v-row class="ms-0">
    <v-avatar class="video-thumb">
      <v-img src="https://cdn.vuetifyjs.com/images/cards/store.jpg"></v-img>
    </v-avatar>
    <div class="flex-column ms-3">
      <div class="text-subtitle-2">{{ video.name }}</div>
      <div class="text-caption">{{ video.channel }}</div>
      <div class="text-caption">
        {{ video.views }} | {{ video.uploadedDate }}
      </div>
    </div>
  </v-row>
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
        }
      },
    },
  },
}
</script>
