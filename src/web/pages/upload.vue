<template>
  <v-container>
    <v-row justify="center" dense>
      <v-col sm="12" md="8" justify="center">
        <v-card class="mx-auto" outlined>
          <v-card-title>Upload</v-card-title>
          <v-card-subtitle
            >Upload your video using the form below.</v-card-subtitle
          >
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field v-model="video.name" label="Title"></v-text-field>
              <v-file-input
                v-model="video.file"
                prepend-icon
                append-icon="$file"
                clear-icon
                label="File"
              ></v-file-input>

              <v-textarea
                v-model="video.description"
                label="Describe your video"
              ></v-textarea>
              <chip-input ref="tagInput"></chip-input>
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
                ref="genreInput"
                label="Genre"
                :items="genres"
              ></chip-input>
              <v-btn :disabled="!valid" color="accent" @click="validate">
                Upload
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
import ChipInput from '~/components/ChipInput.vue'

export default {
  name: 'Upload',
  components: { ChipInput },
  middleware: 'authenticated',
  data: () => ({
    valid: true,
    video: {
      name: null,
      file: null,
      description: null,
      channel: null,
    },
    genres: ['entertainment', 'technology'],
    channels: [],
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
        this.channels = channels
      }
    },

    async validate() {
      this.$refs.form.validate()

      const formData = new FormData()
      formData.append('token', this.$store.state.auth.token)
      formData.append('tags', this.$refs.tagInput.select.join(','))
      formData.append('genres', this.$refs.genreInput.select.join(','))
      formData.append('title', this.video.name)
      formData.append('description', this.video.description)
      formData.append('channel', this.video.channel)
      formData.append('file', this.video.file)

      const response = await this.$sdk.Assets.uploadVideo(formData)
      if (response.error) {
        alert(response.error)
      }
    },
  },
}
</script>
