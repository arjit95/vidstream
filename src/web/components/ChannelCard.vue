<template>
  <div>
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
        <div class="text-caption">{{ channel.subscribers }} Subscribers</div>
        <div class="text-subtitle-2 channel-description">
          {{ channel.description || 'No description available' }}
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
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
    channels: {
      type: Array,
      default: () => [],
    },
  },
}
</script>
