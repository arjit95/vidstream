<template>
  <v-container class="pt-0" fluid>
    <banner></banner>
    <v-container>
      <v-tabs
        v-model="tab"
        background-color="transparent"
        color="accent"
        centered
      >
        <v-tab>Playlists</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab" class="pt-4" style="background: transparent;">
        <v-tab-item class="mx-2">
          <div class="text-body-1 mb-2">Recently Uploaded</div>
          <video-thumbs class="ms-n1" :videos="next" horizontal></video-thumbs>
          <nuxt-link to="/">
            <v-btn color="accent" outlined>View More</v-btn>
          </nuxt-link>
        </v-tab-item>
      </v-tabs-items>
    </v-container>
  </v-container>
</template>
<script>
import VideoThumbs from '~/components/VideoThumbs'
import Banner from '~/components/Banner'

export default {
  name: 'Channel',
  components: { VideoThumbs, Banner },
  data() {
    return {
      tab: null,
      generalItems: [
        {
          icon: 'mdi-youtube-subscription',
          title: 'Recently Added',
          href: '/recents',
        },
        {
          icon: 'mdi-trending-up',
          title: 'Trending',
          href: '/trending',
        },
      ],
      next: [],
    }
  },
  mounted() {
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

    this.next = Array(5).fill(videos)
  },
}
</script>
