<template>
  <v-container class="pl-sm-1 pr-sm-1" fluid>
    <v-row class="mb-4 description-container">
      <v-col cols="1">
        <text-avatar
          class="ms-2"
          :name="videoInfo.channel.title"
          :profile="channelThumb"
          :size="48"
        />
      </v-col>
      <v-col class="pt-1" cols="8">
        <nuxt-link :to="'/channel/' + videoInfo.channel.id">
          <div class="text-subtitle-1">{{ videoInfo.channel.title }}</div>
        </nuxt-link>
        <div class="text-caption mb-4 sub-count">
          {{ videoInfo.channel.subscribers }} subscribers
        </div>
        <markdown-viewer :source="videoInfo.description" />
      </v-col>
      <v-col cols="3">
        <v-btn
          v-if="canSubscribe"
          class="mb-4"
          tile
          color="accent"
          outlined
          @click="toggleSubscription"
        >
          <v-icon left>mdi-youtube-subscription</v-icon> {{ subscribeText }}
        </v-btn>
        <div class="mb-4 text-body-2">
          Categories:
          <span v-for="category in videoInfo.categories" :key="category"
            >{{ category }}&nbsp;</span
          >
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.sub-count {
  opacity: 0.9;
}
.video-description {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
<script>
import MarkdownViewer from '~/components/MarkdownViewer'
import TextAvatar from '~/components/TextAvatar'

export default {
  name: 'VideoDescription',
  components: { MarkdownViewer, TextAvatar },
  props: {
    videoInfo: {
      type: Object,
      default: () => ({
        description: 'No description available',
        channel: {
          id: '',
          title: '',
          subscribers: 0,
          subscribed: false,
        },
        tags: [],
        categories: [],
        user: {
          username: '',
        },
      }),
    },
  },
  computed: {
    canSubscribe() {
      return (
        this.$store.state.app.userInfo.isLoggedIn &&
        this.$store.state.app.userInfo.username !== this.videoInfo.user.username
      )
    },
    formattedDesc() {
      let description = this.videoInfo.description
      description += this.videoInfo.tags.map((tag) => `#${tag}`).join(' ')

      return description
    },

    subscribeText() {
      return this.subscribed ? 'Subscribed' : 'Subscribe'
    },

    channelThumb() {
      return `${this.$config.apiURL}/api/assets/channel?id=${this.videoInfo.channel.id}.png`
    },
  },

  methods: {
    toggleSubscription() {
      this.$emit('subscription', !this.channel.subscribed)
    },
  },
}
</script>
