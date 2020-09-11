<template>
  <v-container class="pt-0" fluid>
    <v-row class="banner-container">
      <v-container>
        <v-row style="height: 100%;">
          <v-col cols="8">
            <p class="text-h4 mb-0">User Name</p>
            <p class="text-subtitle-2">566 total subscribers</p>
            <p class="text-body-2">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum
            </p>
            <v-row>
              <v-btn class="ma-2" outlined color="white">
                <v-icon dense left>mdi-flag</v-icon>Report abuse
              </v-btn>
            </v-row>
          </v-col>
          <v-col cols="3" class="d-flex align-end justify-end">
            <v-avatar color="accent" class="avatar" size="128">
              <span class="white--text headline">User</span>
            </v-avatar>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
    <v-container>
      <div class="channel-header text-body-1 mb-6">Playlists</div>
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
<script>
export default {
  name: 'UserPlaylists',
  mounted() {
    const username = this.$route.params.id
    if (!username) {
      this.$route.push('404')
    }
  },
}
</script>
