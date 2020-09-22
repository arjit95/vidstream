<template>
  <v-container>
    <v-stepper v-model="step">
      <v-card-title>Upload</v-card-title>
      <v-card-subtitle>
        Upload your video using the form below.
      </v-card-subtitle>
      <v-stepper-header>
        <v-stepper-step :complete="step > 1" step="1">Add File</v-stepper-step>

        <v-divider></v-divider>

        <v-stepper-step :complete="step > 2" step="2"
          >Add Description</v-stepper-step
        >
      </v-stepper-header>
      <v-form ref="form" v-model="valid">
        <v-stepper-content step="1">
          <v-row>
            <v-col cols="12" justify="center">
              <v-text-field v-model="video.name" label="Title"></v-text-field>
              <v-file-input
                v-model="video.file"
                prepend-icon
                append-icon="$file"
                clear-icon
                label="File"
              ></v-file-input>
              <v-select
                v-model="video.channel"
                :items="channels"
                item-text="title"
                item-value="id"
                label="Your channels"
                hint="Select channel to upload"
                persistent-hint
              ></v-select>
              <chip-input
                ref="categoryInput"
                label="Categories"
                :items="this.$config.categories"
              ></chip-input>
            </v-col>
          </v-row>
          <v-row class="ms-0">
            <v-btn color="accent" @click="step = 2">
              Continue
            </v-btn>
          </v-row>
        </v-stepper-content>
        <v-stepper-content step="2">
          <v-row>
            <v-col sm="12" md="6" justify="center">
              <v-textarea
                v-model="video.description"
                label="Describe your video"
                hint="Supports markdown"
                auto-grow
              ></v-textarea>
            </v-col>
            <v-col sm="12" md="6" justify="center">
              <markdown-viewer :source="video.description" />
            </v-col>
          </v-row>
          <v-row class="ms-0">
            <v-btn
              color="accent"
              :disabled="!valid"
              :loading="isUploadInProgress"
              @click="validate"
            >
              Upload
            </v-btn>
            <v-btn class="ms-2" color="primary" @click="step = 1">
              Back
            </v-btn>
          </v-row>
        </v-stepper-content>
      </v-form>
    </v-stepper>
  </v-container>
</template>

<style lang="scss" scoped>
.upload-form {
  v-text-field,
  v-file-input {
    width: 100%;
  }
}
</style>

<script>
import MarkdownViewer from '~/components/MarkdownViewer'

export default {
  name: 'Upload',
  components: { MarkdownViewer },
  middleware: 'authenticated',
  data: () => ({
    valid: true,
    video: {
      name: null,
      file: null,
      description: '',
      channel: null,
      tags: [],
    },
    step: 1,
    channels: [],
    isUploadInProgress: false,
  }),

  mounted() {
    this.init()
  },
  methods: {
    async init() {
      // populate channels
      const channels = await this.$sdk.Metadata.getUserChannels()
      if (channels.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: channels.error,
        })
      } else {
        this.channels = channels.result
      }
    },

    async validate() {
      this.$refs.form.validate()

      this.isUploadInProgress = true

      const formData = new FormData()
      formData.append('token', this.$store.state.auth.token)
      formData.append('tags', this.getTags().join(','))
      formData.append(
        'categories',
        this.$refs.categoryInput.select
          .map((str) => str.toLowerCase())
          .join(',')
      )

      formData.append('title', this.video.name.trim())
      formData.append('description', this.video.description.trim())
      formData.append('channel', this.video.channel)
      formData.append('file', this.video.file)

      const response = await this.$sdk.Assets.uploadVideo(formData)
      this.isUploadInProgress = false

      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })
      } else {
        this.$router.push('/')
      }
    },

    getTags() {
      const description = this.video.description.trim()
      const matcher = /(\s|^)#\w\w+\b/gm
      const result = description.match(matcher)
      if (result) {
        return result.map((s) => s.trim())
      }

      return []
    },
  },
}
</script>
