<template>
  <v-container class="pt-0" fluid>
    <banner
      :title="channel.title"
      :subtitle1="channel.created_at"
      :body="channel.description || undefined"
      :banner-bg="`${apiURL}/api/assets/channel/banner?id=${channel.id}`"
      :profile="`${apiURL}/api/assets/channel?id=${channel.id}`"
    ></banner>
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
          <video-thumbs
            class="ms-n1"
            :videos="recents"
            horizontal
          ></video-thumbs>
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

  async asyncData({ $sdk, params, redirect, $config }) {
    const channelId = params.ci
    const channel = await $sdk.Metadata.getChannel(channelId)
    if (channel.error) {
      return { channel: null }
    }

    return { channel }
  },
  data() {
    return {
      tab: null,
      recents: [],
    }
  },

  async mounted() {
    const channelId = this.$route.params.ci
    const recents = await this.$sdk.Metadata.getUserVideos(channelId)
    if (recents.error) {
      return
    }

    this.recents = recents.result
  },
}
</script>
