<template>
  <v-row class="banner-container" :style="coverBackground">
    <v-container>
      <v-row style="height: 100%;">
        <v-col cols="8">
          <p class="text-h4 mb-0">{{ title }}</p>
          <p class="text-subtitle-2 mb-0">{{ subtitle1 }}</p>
          <p class="text-caption">
            {{ subtitle2 }}
            <nuxt-link
              v-if="subtitleLink.link"
              :to="subtitleLink.link"
              class="text-subtitle-2"
              >{{ subtitleLink.text }}</nuxt-link
            >
          </p>
          <p class="text-body-2">
            {{ body }}
          </p>
          <v-row v-if="actions.length > 0">
            <v-btn
              v-for="action in actions"
              :key="action.text"
              class="ma-2"
              outlined
              color="white"
              @click="action.onClick"
            >
              <v-icon dense left>action.icon</v-icon>action.text
            </v-btn>
          </v-row>
        </v-col>
        <v-col v-if="profile" cols="3" class="d-flex align-end justify-end">
          <v-avatar color="accent" class="avatar" size="128">
            <v-img :src="profile"></v-img>
          </v-avatar>
        </v-col>
      </v-row>
    </v-container>
  </v-row>
</template>

<style scoped>
.banner-container {
  position: relative;
  height: 50vh;
  margin-bottom: 64px;
}

.avatar {
  margin-bottom: -90px;
  z-index: 99;
}
</style>

<script>
export default {
  name: 'Banner',
  props: {
    title: {
      type: String,
      default: '',
    },
    subtitle1: {
      type: String,
      default: '',
    },
    subtitle2: {
      type: String,
      default: '',
    },
    subtitleLink: {
      type: Object,
      default: () => ({
        text: null,
        link: null,
      }),
    },
    body: {
      type: String,
      default: 'No description available',
    },
    bannerBg: {
      type: String,
      default: null,
    },
    profile: {
      type: String,
      default: null,
    },
    actions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      coverBackground: {
        type: String,
        default: '',
      },
    }
  },
  watch: {
    bannerBg() {
      this.coverBackground = `background: linear-gradient(rgba(0, 0, 0, 0.45),
        rgba(0, 0, 0, 0.45)),
        url('${this.bannerBg}')`
    },
  },
}
</script>
