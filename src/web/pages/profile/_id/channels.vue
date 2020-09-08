<template>
  <v-container class="pt-0" fluid>
    <banner></banner>
    <v-container>
      <div class="channel-header text-body-1 mb-6">Channel list</div>
      <v-card v-for="channel in channels" :key="channel.title" max-width="344">
        <v-img
          height="160"
          src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
        >
        </v-img>
        <v-card-text>
          <div class="text-body-1">
            <nuxt-link :to="'/channel/' + channel.id">
              {{ channel.title }}
            </nuxt-link>
          </div>
          <div class="text-caption">
            {{ channel.views }} Viewers • {{ channel.videos }} Video(s)
          </div>
          <div class="text-subtitle-2 channel-description">
            {{ channel.description }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text>Subscribe</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-container>
</template>

<style lang="scss" scoped>
.channel-description {
  display: block;
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow: hidden;
  max-height: 3.4em;
}
</style>
<script>
import Banner from '~/components/Banner'

export default {
  name: 'Channels',
  components: { Banner },
  data() {
    return {
      channels: [],
    }
  },
  mounted() {
    const username = this.$route.params.id
    if (!username) {
      this.$router.push('/404')
      return
    }

    this.$sdk.Metadata.getUserChannels(username).then((response) => {
      if (Object.prototype.hasOwnProperty.call(response, 'error')) {
        this.$router.push('/404')
        return
      }

      const apiURL = this.$config.apiURL
      for (const channel of response) {
        Object.assign(channel, {
          banner: `${apiURL}/api/assets/channel/banner?id${channel.id}`,
          views: channel.viewCount,
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        })

        this.channels.push(channel)
      }
    })
  },
}
</script>
