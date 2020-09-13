<template>
  <v-container class="pt-0" fluid>
    <banner
      :title.sync="channel.title"
      :subtitle1="channel.createdAt"
      :body.sync="channel.description"
      subtitle2="Created by"
      :subtitle-link="subtitleLink"
      :banner-bg="`${apiURL}/api/assets/channel/banner?id=${channel.id}`"
      :profile="`${apiURL}/api/assets/channel?id=${channel.id}`"
      :editable="editable"
    ></banner>
    <v-container>
      <div class="text-body-1 mb-2">Recently Uploaded</div>
      <video-thumbs
        class="ms-n1"
        :videos="recents.result"
        horizontal
        :loading="loading"
      ></video-thumbs>
      <nuxt-link v-if="recents.total > recents.result.length" to="/">
        <v-btn color="accent" outlined>View More</v-btn>
      </nuxt-link>
    </v-container>
  </v-container>
</template>
<script>
import Humanize from 'humanize-duration'
import VideoThumbs from '~/components/VideoThumbs'
import Banner from '~/components/Banner'

export default {
  name: 'Channel',
  components: { VideoThumbs, Banner },

  async asyncData({ $sdk, params, redirect }) {
    const channelId = params.ci
    const channel = await $sdk.Metadata.getChannel(channelId)
    channel.createdAt = `Created ${Humanize(
      Date.now() - new Date(channel.created_at).getTime(),
      {
        largest: 1,
      }
    )} ago`

    if (channel.error) {
      redirect(404)
      return
    }

    return { channel }
  },
  data() {
    return {
      tab: null,
      recents: {
        result: [],
        total: 0,
      },
      apiURL: this.$config.apiURL,
      loading: true,
    }
  },
  computed: {
    editable() {
      return (
        this.channel.user.username === this.$store.state.app.userInfo.username
      )
    },
    subtitleLink() {
      const text =
        this.$store.state.app.userInfo.username === this.channel.user.username
          ? 'you'
          : this.channel.user.name

      return {
        text,
        link: `/profile/${this.channel.user.username}`,
      }
    },
  },
  watch: {
    'channel.title'() {
      // TODO: Save updated channel title
    },
    'channel.description'() {
      // TOOD: Save updated channel description
    },
  },

  async mounted() {
    const channelId = this.$route.params.ci
    const recents = await this.$sdk.Metadata.getUserVideos(channelId)
    if (recents.error) {
      return
    }

    this.recents = recents
    this.loading = false
  },
}
</script>
