<template>
  <v-row>
    <v-col v-if="isAdmin && !canCreate" md="4" sm="12">
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="6" offset="5">
              <v-btn
                icon
                color="accent"
                outlined
                :disabled="disabled"
                @click="addChannel"
              >
                <v-icon dense>mdi-plus</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" align="center">
              <div class="text-body-2">Create new channel</div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col v-for="channel in channels" :key="channel.title" md="4" sm="12">
      <v-card>
        <v-img height="160" :src="getBanner(channel)" />
        <v-card-text>
          <div class="text-body-1">
            <nuxt-link :to="'/channel/' + channel.id">
              {{ channel.title }}
            </nuxt-link>
          </div>
          <div class="text-caption">{{ getSubscribers(channel) }}</div>
          <div class="text-subtitle-2 channel-description">
            {{ channel.description || 'No description available' }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      v-if="!(isAdmin && !canCreate) && !channels.length"
      class="empty-content d-flex align-center"
    >
      <v-row justify="center">
        <div class="text-body-1">No content</div>
      </v-row>
    </v-col>
  </v-row>
</template>

<style scoped>
.empty-content {
  min-height: 30vh;
}

.channel-description {
  display: block;
  text-overflow: ellipsis;
  word-wrap: break-word;
  overflow: hidden;
  max-height: 3.4em;
}
</style>

<script>
export default {
  props: {
    canCreate: {
      type: Boolean,
      default: false,
    },
    channels: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: () => ({
        username: null,
      }),
    },
  },
  computed: {
    isAdmin() {
      if (!this.channels.length) {
        return false
      }

      const isLoggedIn = this.$store.state.app.userInfo.isLoggedIn
      return (
        isLoggedIn &&
        this.user.username === this.$store.state.app.userInfo.username
      )
    },
  },
  methods: {
    getBanner(channel) {
      const apiURL = this.$config.apiURL
      return `${apiURL}/api/assets/channel/banner?id=${channel.id}.png`
    },
    addChannel() {
      this.$emit('addChannel')
    },
    getSubscribers(channel) {
      return this.$sdk.Utils.pluralize(channel.subscribers, 'Subscriber')
    },
  },
}
</script>
