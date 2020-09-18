<template>
  <v-container class="pt-0">
    <banner
      :title.sync="user.name"
      :subtitle1="createdAt"
      :body.sync="user.description"
      :banner-bg="`${apiURL}/api/assets/user/profile/banner?id=${user.username}.png`"
      :profile="`${apiURL}/api/assets/user/profile?id=${user.username}.png`"
      :editable="editable"
      @profileChange="updateProfile"
      @bannerChange="updateBanner"
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
    createdAt() {
      return `Joined ${Humanize(
        Date.now() - new Date(this.user.joined).getTime(),
        {
          largest: 1,
        }
      )} ago`
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

    this.$sdk.Metadata.getUserChannels(username).then((response) => {
      this.channels = response.result
    })
  },
  methods: {
    async updateInfo() {
      const response = await this.$sdk.Metadata.editUserInfo(
        this.user.name,
        this.user.description
      )

      this.$store.commit('app/setUserInfo', { name: this.user.name })
      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      }
    },

    async updateProfile(file) {
      const formData = new FormData()
      formData.append('id', this.user.username)
      formData.append('token', this.$store.state.auth.token)
      formData.append('file', file, 'profile.png')

      const response = await this.$sdk.Assets.uploadUserProfile(formData)
      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      }
    },

    async updateBanner(file) {
      const formData = new FormData()
      formData.append('id', this.user.username)
      formData.append('token', this.$store.state.auth.token)
      formData.append('file', file, 'banner.png')

      const response = await this.$sdk.Assets.uploadUserBanner(formData)
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
