<template>
  <v-container class="pt-0">
    <banner
      :title.sync="user.name"
      :subtitle1="user.createdAt"
      :body.sync="user.description"
      :banner-bg="`${apiURL}/api/assets/user/profile/banner?id=${user.username}.png`"
      :profile="`${apiURL}/api/assets/user/profile?id=${user.username}.png`"
      :editable="editable"
    />
    <v-container>
      <div class="text-body-1 mb-6">Subscriptions</div>
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

    user.createdAt = `Joined ${Humanize(
      Date.now() - new Date(user.joined).getTime(),
      {
        largest: 1,
      }
    )} ago`

    return { user }
  },

  data() {
    return {
      channels: [],
      apiURL: this.$config.apiURL,
    }
  },
  computed: {
    editable() {
      return this.$route.params.id === this.$store.state.app.userInfo.username
    },
  },
  watch: {
    'user.name'() {
      return this.updateInfo()
    },
    'user.description'() {
      return this.updateInfo()
    },
  },

  mounted() {
    const username = this.$route.params.id
    if (!username) {
      this.$router.push('/404')
      return
    }

    this.$sdk.Metadata.getSubscriptions(true).then((response) => {
      this.channels = response.result.map(({ channel }) => channel)
    })
  },
  methods: {
    async updateInfo() {
      const response = await this.$sdk.Metadata.editUserInfo(
        this.user.name,
        this.user.description
      )

      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      }
    },
  },
}
</script>
