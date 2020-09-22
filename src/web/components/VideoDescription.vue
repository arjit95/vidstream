<template>
  <v-container class="pl-sm-1 pr-sm-1" fluid>
    <v-row class="mb-4 description-container">
      <v-col cols="1">
        <v-avatar class="ms-2">
          <v-img
            class="description-thumb"
            src="https://cdn.vuetifyjs.com/images/cards/store.jpg"
          ></v-img>
        </v-avatar>
      </v-col>
      <v-col class="pt-0" cols="8">
        <nuxt-link :to="'/channel/' + videoInfo.channel.id">
          <div class="text-subtitle-1">{{ videoInfo.channel.title }}</div>
        </nuxt-link>
        <div class="text-caption mb-4 sub-count">
          {{ videoInfo.channel.subscribers }} subscribers
        </div>
        <markdown-viewer :source="videoInfo.description" />
      </v-col>
      <v-col cols="3">
        <v-btn v-if="canSubscribe" class="mb-4" tile color="accent" outlined>
          <v-icon left>mdi-youtube-subscription</v-icon> Subscribe
        </v-btn>
        <div class="mb-4 text-body-2">
          Genres:
          <span v-for="genre in videoInfo.genres" :key="genre"
            >{{ genre }}&nbsp;</span
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

export default {
  name: 'VideoDescription',
  components: { MarkdownViewer },
  props: {
    videoInfo: {
      type: Object,
      default: () => ({
        description: 'No description available',
        channel: {
          id: '',
          title: '',
          subscribers: 0,
        },
        tags: [],
        genres: [],
        user: {
          username: '',
        },
      }),
    },
  },

  computed: {
    canSubscribe() {
      return (
        this.$store.state.app.userInfo.username !== this.videoInfo.user.username
      )
    },
    formattedDesc() {
      let description = this.videoInfo.description
      description += this.videoInfo.tags.map((tag) => `#${tag}`).join(' ')

      return description
    },
  },
}
</script>
