<template>
  <v-container class="pl-sm-1 pr-sm-1" fluid>
    <v-row class="mb-4 description-container">
      <v-col cols="1">
        <v-avatar class="ms-2">
          <v-img
            class="description-thumb"
            src="https://cdn.vuetifyjs.com/images/cards/store.jpg"
          ></v-img>
        </v-avatar>
      </v-col>
      <v-col class="pt-0" cols="8">
        <nuxt-link :to="'/channel/' + videoInfo.channel.id">
          <div class="text-subtitle-1">{{ videoInfo.channel.title }}</div>
        </nuxt-link>
        <div class="text-caption mb-4 sub-count">
          {{ videoInfo.channel.subscribers }} subscribers
        </div>
        <div class="text-body-2">
          {{ videoInfo.description }}
        </div>
      </v-col>
      <v-col cols="3">
        <v-btn class="mb-4" tile color="accent" outlined>
          <v-icon left>mdi-youtube-subscription</v-icon> Subscribe
        </v-btn>
        <div class="mb-4 text-body-2">
          Genres:
          <span v-for="genre in videoInfo.genres" :key="genre"
            >{{ genre }}&nbsp;</span
          >
        </div>
        <div class="text-body-2">
          Tags:
          <span v-for="tag in videoInfo.tags" :key="tag">{{ tag }}&nbsp;</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.sub-count {
  opacity: 0.9;
}
</style>
<script>
export default {
  name: 'VideoDescription',
  props: {
    videoInfo: {
      type: Object,
      default: () => ({
        description: 'No description available',
        channel: {
          id: '',
          title: '',
          subscribers: 0,
        },
        tags: [],
        genres: [],
      }),
    },
  },
}
</script>
