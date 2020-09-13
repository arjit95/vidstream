<template>
  <v-row class="banner-container" :style="{ background: background }">
    <v-container>
      <v-row style="height: 100%;">
        <v-col cols="8">
          <editable-field single-line :model.sync="title" :editable="editable">
            <p class="text-h4 mb-0">{{ title }}</p>
          </editable-field>
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
          <editable-field :model.sync="body" :editable="editable">
            <p class="text-body-2">
              {{ body || 'No Description Avaialble' }}
            </p>
          </editable-field>
          <v-row v-if="actions.length > 0">
            <v-btn
              v-for="action in actions"
              :key="action.text"
              class="ma-2"
              outlined
              color="white"
              :disabled="action.disabled"
              :loading="action.loading"
              @click="action.onClick"
            >
              <v-icon dense left>{{ action.icon }}</v-icon>
              {{ action.text }}
            </v-btn>
          </v-row>
        </v-col>
        <v-col v-if="profile" cols="3" class="d-flex align-end justify-end">
          <v-avatar color="accent" class="avatar" size="128">
            <v-img :src="profile" height="128" width="128" />
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
import EditableField from '~/components/EditableField'

export default {
  name: 'Banner',
  components: { EditableField },
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
    editable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    background() {
      return `linear-gradient(rgba(0, 0, 0, 0.45),
        rgba(0, 0, 0, 0.45)),
        url('${this.bannerBg}')`
    },
  },
  watch: {
    title() {
      this.$emit('update:title', this.title)
    },
    body() {
      this.$emit('update:body', this.body)
    },
  },
}
</script>
