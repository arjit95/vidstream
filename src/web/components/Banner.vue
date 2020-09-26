<template>
  <v-row ref="bannerContainer" class="banner-container">
    <image-uploader
      class="banner"
      :input-width="bannerWidth"
      :input-height="bannerHeight"
      output-width="960"
      output-height="360"
      overlay="rgba(0, 0, 0, 0.45)"
      @image="uploadBanner"
    >
      <template #image>
        <v-img :src="bannerBg" :width="bannerWidth" :height="bannerHeight" />
      </template>
    </image-uploader>
    <v-container>
      <v-row style="height: 100%;">
        <v-col cols="8" class="description-col">
          <editable-field
            single-line
            :model.sync="titleInput"
            :editable="editable"
            :rules="rules"
          >
            <p class="text-h4 mb-0">{{ titleInput }}</p>
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
          <editable-field
            :model.sync="bodyInput"
            :editable="editable"
            :maxlength="500"
          >
            <p class="text-body-2">
              {{ bodyInput || 'No Description Available' }}
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
          <image-uploader
            input-width="128"
            input-height="128"
            radius="128"
            @image="uploadImage"
          >
            <template #image>
              <text-avatar
                class="avatar"
                :name="profileName"
                :profile="profile"
              />
            </template>
          </image-uploader>
        </v-col>
      </v-row>
    </v-container>
  </v-row>
</template>

<style scoped>
.banner {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.banner-container {
  position: relative;
  height: 50vh;
  margin-bottom: 72px;
}

.avatar {
  margin-bottom: -90px;
  z-index: 99;
}

.description-col p {
  position: relative;
}
</style>

<script>
import EditableField from '~/components/EditableField'
import ImageUploader from '~/components/ImageUploader'
import TextAvatar from '~/components/TextAvatar'

export default {
  name: 'Banner',
  components: { EditableField, ImageUploader, TextAvatar },
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
    profileName: {
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
  data() {
    return {
      rules: [(value) => !!value],
      titleInput: this.title,
      bodyInput: this.body,
      bannerContainerHeight: '0',
      bannerContainerWidth: '0',
    }
  },
  computed: {
    bannerWidth() {
      return this.bannerContainerWidth
    },
    bannerHeight() {
      return this.bannerContainerHeight
    },
  },
  watch: {
    titleInput(val) {
      this.$emit('update:title', val)
    },
    bodyInput(val) {
      this.$emit('update:body', val)
    },
  },
  mounted() {
    this.$nextTick(this.updateBCWidth)
    window.addEventListener('resize', this.updateBCWidth)
  },
  destroy() {
    window.removeEventListener('resize', this.updateBCWidth)
  },
  methods: {
    updateBCWidth() {
      const container = this.$refs.bannerContainer
      if (!container) {
        return
      }

      this.bannerContainerWidth = container.clientWidth.toString()
      this.bannerContainerHeight = container.clientHeight.toString()
    },
    uploadImage(value) {
      this.profile = URL.createObjectURL(value.scaled)
      this.$emit('profileChange', value.original)
    },
    uploadBanner(value) {
      this.bannerBg = URL.createObjectURL(value.scaled)
      this.$emit('bannerChange', value.original)
    },
  },
}
</script>
