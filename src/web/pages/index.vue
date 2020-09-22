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
          <video-thumbs
            :videos="playlist.children"
            horizontal
            :loading="false"
          ></video-thumbs>
          <nuxt-link
            v-if="playlist.total > playlist.children.length"
            :to="playlist.href"
          >
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
  async asyncData({ $sdk, error }) {
    const [recents, trending] = await Promise.all([
      $sdk.Metadata.getRecentVideos(),
      $sdk.Metadata.getTrendingVideos(),
    ])

    if (recents.error || trending.error) {
      return error({
        statusCode: 500,
        message: recents.error || trending.error,
      })
    }

    const playlists = [
      {
        title: 'Recently uploaded',
        href: '/page/recent',
        children: recents.result,
        total: trending.total,
      },
      {
        title: 'Recommended',
        href: '/page/recommended',
        children: trending.result,
        total: trending.total,
      },
    ]

    return {
      playlists,
    }
  },
  computed: {
    panel() {
      return this.playlists.map((_, i) => i)
    },
  },
  async mounted() {
    this.$nextTick(() => {
      window.addEventListener('scroll', this.onScroll)
    })

    if (this.$store.state.app.userInfo.isLoggedIn) {
      await this.loadSubscriptions()
    }
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    async loadSubscriptions() {
      const subscriptions = await this.$sdk.Metadata.getSubscriptions()
      if (subscriptions.error) {
        return
      }

      const channels = subscriptions.result.map(({ channel, videos }) => {
        return {
          title: channel.title,
          href: `/channel/${channel.id}/`,
          id: channel.id,
          children: videos.result.map((video) => {
            video.channel = channel
            return video
          }),
          total: videos.total,
        }
      })

      this.playlists = this.playlists.concat(
        channels.filter(({ total }) => total)
      )
    },

    onScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        // load more content
      }
    },
  },
}
</script>
