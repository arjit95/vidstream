<template>
  <v-container>
    <v-expansion-panels v-model="panel" flat multiple>
      <v-expansion-panel
        v-for="playlist in playlists"
        :key="playlist.channel"
        style="background-color: transparent;"
        fluid
      >
        <v-expansion-panel-header class="text-body-1">
          {{ playlist.title }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <video-thumbs :videos="playlist.children" horizontal></video-thumbs>
          <nuxt-link :to="playlist.href">
            <v-btn color="accent" outlined>View More</v-btn>
          </nuxt-link>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
import VideoThumbs from '~/components/VideoThumbs'

export default {
  name: 'Home',
  components: { VideoThumbs },
  data: () => {
    const video = {
      name: 'Video name',
      channel: 'Channel name',
      views: 1234,
      uploadedDate: '4 days ago',
      thumb: 'https://cdn.vuetifyjs.com/images/cards/store.jpg',
      channelThumb: 'https://cdn.vuetifyjs.com/images/cards/store.jpg',
      url: '/watch/123',
      channelURL: '/channel/123',
    }

    return {
      playlists: [
        {
          title: 'Recently uploaded',
          href: '/page/recent',
          children: Array(10).fill(video),
        },
        {
          title: 'Recommended',
          href: '/page/recommended',
          children: Array(10).fill(video),
        },
        {
          title: 'Subscribed 1',
          href: '/channel/abc',
          children: Array(4).fill(video),
        },
        {
          title: 'Subscribed 1',
          href: '/channel/abc',
          children: Array(6).fill(video),
        },
      ],
    }
  },
  computed: {
    panel() {
      return this.playlists.map((_, i) => i)
    },
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('scroll', this.onScroll)
    })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        // load more contents
      }
    },
  },
}
</script>
