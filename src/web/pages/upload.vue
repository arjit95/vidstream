<template>
  <v-container>
    <v-row justify="center" dense>
      <v-col sm="12" md="8" justify="center">
        <v-card class="mx-auto" color="cardBg" outlined>
          <v-card-title>Upload</v-card-title>
          <v-card-subtitle
            >Upload your video using the form below.</v-card-subtitle
          >
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field v-model="videoName" label="Title"></v-text-field>
              <v-file-input
                v-model="file"
                prepend-icon
                append-icon="$file"
                clear-icon
                label="File"
              ></v-file-input>

              <v-textarea label="Describe your video"></v-textarea>
              <chip-input ref="tagInput"></chip-input>
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

  data: () => ({
    valid: true,
    file: [],
    videoName: '',
  }),
  methods: {
    validate() {
      this.$refs.form.validate()
    },
  },
}
</script>
