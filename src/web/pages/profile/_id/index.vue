<template>
  <v-container class="pt-0">
    <banner
      :title.sync="user.name"
      :subtitle1="createdAt"
      :body.sync="user.description"
      :banner-bg="`${apiURL}/api/assets/user/profile/banner?id=${user.username}.png`"
      :profile="`${apiURL}/api/assets/user/profile?id=${user.username}.png`"
      :profile-name="user.name"
      :editable="isAdmin"
      @profileChange="updateProfile"
      @bannerChange="updateBanner"
    />
    <v-card>
      <v-tabs v-model="tab" color="accent-4" centered @change="loadContent">
        <v-tab>Channels</v-tab>
        <v-tab v-if="isAdmin">Subscriptions</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <channel-card
            :channels="channels"
            :disabled="processing"
            :user="user"
            @addChannel="addChannel"
          />
        </v-tab-item>
        <v-tab-item>
          <channel-card
            :channels="subscriptions"
            :can-create="false"
            :user="user"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>
<script>
import Humanize from 'humanize-duration'
import Banner from '~/components/Banner'
import ChannelCard from '~/components/ChannelCard'

export default {
  name: 'Channels',
  components: { Banner, ChannelCard },

  async asyncData({ $store, $sdk, params, redirect }) {
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
      subscriptions: [],
      apiURL: this.$config.apiURL,
      processing: false,
      subscriptionsLoaded: false,
      tab: null,
    }
  },
  computed: {
    isAdmin() {
      const userInfo = this.$store.state.app.userInfo
      return userInfo.isLoggedIn && userInfo.username === this.$route.params.id
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
    async deleteChannel(id) {
      this.processing = true

      const response = await this.$sdk.Metadata.deleteChannel(id)
      this.processing = false

      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
        return
      }

      this.channels.splice(
        this.channels.findIndex(({ id }) => id),
        1
      )
    },

    async addChannel() {
      this.processing = true
      const title = `Channel ${this.channels.length}`
      const response = await this.$sdk.Metadata.addChannel(title)
      this.processing = false

      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
        return
      }

      this.channels.push(response)
    },

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

    async loadSubscriptions() {
      if (this.subscriptionsLoaded) {
        return
      }

      const subscriptions = await this.$sdk.Metadata.getSubscriptions(true)
      if (subscriptions.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: subscriptions.error,
        })

        return
      }

      this.subscriptionsLoaded = true
      this.subscriptions = subscriptions.result
    },

    loadContent(num) {
      switch (num) {
        case 1:
          this.loadSubscriptions()
          break
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
