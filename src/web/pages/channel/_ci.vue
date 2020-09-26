<template>
  <v-container class="pt-0">
    <banner
      :title.sync="channel.title"
      :subtitle1="subCount"
      :body.sync="channel.description"
      subtitle2="Created by"
      :subtitle-link="subtitleLink"
      :banner-bg="`${apiURL}/api/assets/channel/banner?id=${channel.id}.png`"
      :profile="`${apiURL}/api/assets/channel?id=${channel.id}.png`"
      :profile-name="channel.title"
      :editable="editable"
      :actions="actions"
      @profileChange="updateProfile"
      @bannerChange="updateBanner"
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
import VideoThumbs from '~/components/VideoThumbs'
import Banner from '~/components/Banner'

export default {
  name: 'Channel',
  components: { VideoThumbs, Banner },

  async asyncData({ $sdk, params, redirect, store }) {
    const channelId = params.ci
    const channel = await $sdk.Metadata.getChannel(channelId)
    if (channel.error) {
      redirect(404)
      return
    }

    const username = store.state.app.userInfo.username
    let isSubscribed = null

    if (username && username !== channel.user.username) {
      isSubscribed = await $sdk.Metadata.isSubscribed(channelId)
    }

    return { channel, isSubscribed }
  },
  data() {
    const actions = []

    return {
      tab: null,
      recents: {
        result: [],
        total: 0,
      },
      apiURL: this.$config.apiURL,
      loading: true,
      actions,
    }
  },
  computed: {
    subCount() {
      return this.$sdk.Utils.pluralize(this.channel.subscribers, 'Subscriber')
    },

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
    unsubscribeAction() {
      const channelId = this.$route.params.ci
      const disabled =
        !this.$store.state.app.userInfo.isLoggedIn ||
        this.channel.user.username === this.$store.state.app.userInfo.username

      const unsubscribe = {
        text: 'Subscribed',
        icon: 'mdi-check',
        onClick: async () => {
          unsubscribe.loading = true
          const response = await this.$sdk.Metadata.removeSubscription(
            channelId
          )

          unsubscribe.loading = false

          if (response.error) {
            this.$nuxt.$emit('childEvent', {
              action: 'error',
              message: response.error,
            })

            return
          }

          this.actions.shift()
          this.actions.unshift(this.subscribeAction)
        },
        disabled,
        loading: false,
      }

      return unsubscribe
    },
    subscribeAction() {
      const channelId = this.$route.params.ci
      const disabled =
        !this.$store.state.app.userInfo.isLoggedIn ||
        this.channel.user.username === this.$store.state.app.userInfo.username

      const subscribe = {
        icon: 'mdi-youtube-subscription',
        text: 'Subscribe',
        onClick: async () => {
          subscribe.loading = true
          const response = await this.$sdk.Metadata.addSubscription(channelId)
          subscribe.loading = false
          if (response.error) {
            this.$nuxt.$emit('childEvent', {
              action: 'error',
              message: response.error,
            })

            return
          }

          this.actions.shift()
          this.actions.unshift(this.unsubscribeAction)
        },
        disabled,
        loading: false,
      }

      return subscribe
    },
  },
  watch: {
    'channel.title'() {
      return this.updateInfo()
    },
    'channel.description'() {
      return this.updateInfo()
    },
  },

  async mounted() {
    if (typeof this.isSubscribed === 'boolean') {
      if (this.isSubscribed) {
        this.actions.unshift(this.unsubscribeAction)
      } else {
        this.actions.unshift(this.subscribeAction)
      }
    } else {
      this.actions = []
    }

    const userInfo = this.$store.state.app.userInfo
    const isAdmin =
      userInfo.isLoggedIn && this.channel.user.username === userInfo.username

    if (isAdmin) {
      const deleteChannel = {
        text: 'Delete channel',
        icon: 'mdi-delete',
        loading: false,
        onClick: async () => {
          deleteChannel.loading = true
          const response = await this.$sdk.Metadata.deleteChannel(
            this.channel.id
          )

          if (response.error) {
            this.$nuxt.$emit('childEvent', {
              action: 'error',
              message: response.error,
            })

            return
          }

          this.$router.push(`/profile/${userInfo.username}`)
        },
      }

      this.actions.push(deleteChannel)
    }

    const channelId = this.$route.params.ci
    const recents = await this.$sdk.Metadata.getUserVideos(channelId)
    if (recents.error) {
      return
    }

    this.recents = recents
    this.loading = false
  },
  methods: {
    async updateInfo() {
      const response = await this.$sdk.Metadata.editChannelInfo(
        this.channel.id,
        this.channel.title,
        this.channel.description
      )

      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      }
    },

    async updateProfile(file) {
      const formData = new FormData()
      formData.append('id', this.channel.id)
      formData.append('token', this.$store.state.auth.token)
      formData.append('file', file, 'profile.png')

      const response = await this.$sdk.Assets.uploadChannelProfile(formData)
      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      }
    },

    async updateBanner(file) {
      const formData = new FormData()
      formData.append('id', this.channel.id)
      formData.append('token', this.$store.state.auth.token)
      formData.append('file', file, 'banner.png')

      const response = await this.$sdk.Assets.uploadChannelBanner(formData)
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
