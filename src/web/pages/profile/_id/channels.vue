<template>
  <v-container class="pt-0" fluid>
    <banner
      :title="user.name"
      :subtitle1="user.created_at"
      :body="user.description || undefined"
      :banner-bg="`${apiURL}/api/assets/user/profile/banner?id=${user.username}`"
      :profile="`${apiURL}/api/assets/user/profile?id=${user.username}`"
    />
    <v-container>
      <div class="text-body-1 mb-6">Channel list</div>
      <channel-card :channels="channels" />
    </v-container>
  </v-container>
</template>
<script>
import Humanize from 'humanize-duration'
import Banner from '~/components/Banner'
import ChannelCard from '~/components/ChannelCard'

export default {
  name: 'Channels',
  components: { Banner, ChannelCard },

  async asyncData({ $sdk, params, redirect }) {
    const user = await $sdk.Metadata.getUser(params.id)
    if (user.error) {
      redirect('/404')
      return
    }

    user.created_at =
      Humanize(Date.now() - new Date(user.joined).getTime(), {
        largest: 1,
      }) + ' ago'

    return { user }
  },

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
      for (const channel of response.result) {
        Object.assign(channel, {
          banner: `${apiURL}/api/assets/channel/banner?id${channel.id}`,
        })

        this.channels.push(channel)
      }
    })
  },
}
</script>
