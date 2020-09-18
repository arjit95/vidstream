<template>
  <div>
    <div
      :class="(disabled ? 'disabled ' : '') + 'image-preview'"
      @click="dialog = true"
    >
      <slot name="image"></slot>
      <div
        v-if="overlay"
        class="overlay-container"
        :style="overlayStyles"
      ></div>
    </div>
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      class="dialog"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Upload</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="save">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container
            v-if="!file"
            class="d-flex flex-column justify-center align-center image-container"
            @drop.prevent="addFile"
            @dragover.prevent
          >
            <v-row justify="center" align="center">
              <slot name="image"></slot>
            </v-row>
            <v-row justify="center" align="center">
              <p class="text-h6">
                Drag an image here or click upload
              </p>
            </v-row>
            <input
              ref="fileInput"
              style="display: none;"
              filled
              type="file"
              @change="handleFile"
            />
            <v-row>
              <v-btn color="accent" @click="$refs.fileInput.click()">
                Select File
              </v-btn>
            </v-row>
          </v-container>
          <v-container
            v-if="file"
            class="d-flex flex-column justify-center align-center image-container"
          >
            <div :style="cropContainerStyle">
              <div
                ref="cropPreview"
                :style="cropContainerStyle"
                class="crop-preview"
              ></div>
            </div>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.crop-preview {
  display: block;
  max-width: 100%;
}

.dialog {
  z-index: 999999;
}

.image-container {
  height: 80vh;
}

.disabled {
  pointer-events: none;
}

.image-preview:hover * {
  cursor: pointer;
  box-shadow: 0 0 8px var(--v-accent-lighten1);
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
<script>
import Croppie from 'croppie/croppie'
import 'croppie/croppie.css'

export default {
  name: 'ImageUploader',
  props: {
    inputWidth: {
      type: String,
      default: () => '72',
    },
    inputHeight: {
      type: String,
      default: () => '72',
    },
    outputWidth: {
      type: String,
      default: () => undefined,
    },
    outputHeight: {
      type: String,
      default: () => undefined,
    },
    radius: {
      type: String,
      default: () => '0',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    overlay: {
      type: String,
      default: () => undefined,
    },
  },
  data() {
    return {
      dialog: false,
      instance: null,
      file: null,
    }
  },
  computed: {
    borderRadius() {
      return `border-radius: ${this.radius}px;`
    },
    cropContainerStyle() {
      let styles = ''
      styles += `width: ${this.outputWidth || this.inputWidth}px;`
      styles += `height: ${this.outputHeight || this.inputHeight}px;`
      styles += `border-radius: ${this.radius}px;`

      return styles
    },
    overlayStyles() {
      let styles = ''
      styles += `width: ${this.inputWidth}px;`
      styles += `height: ${this.inputHeight}px;`
      return styles + `background: ${this.overlay};`
    },
  },
  watch: {
    dialog() {
      if (!this.dialog && this.instance) {
        this.instance.destroy()
        this.file = null
        this.instance = null
      }
    },
  },
  methods: {
    handleFile(event) {
      const file = event.target.files[0]
      if (!file) return

      this.file = file
      this.$nextTick(() => {
        const reader = new FileReader()

        reader.onload = (e) => {
          const image = this.$refs.cropPreview.$el || this.$refs.cropPreview
          this.instance = new Croppie(image, {
            enableExif: true,
            viewport: {
              width: this.outputWidth || this.inputWidth,
              height: this.outputHeight || this.inputHeight,
              type: this.radius !== '0' ? 'circle' : 'square',
            },
          })

          this.instance.bind({
            url: e.target.result,
          })
        }

        reader.readAsDataURL(this.file)
      })
    },
    dropFile(e) {
      const droppedFiles = e.dataTransfer.files
      if (!droppedFiles || droppedFiles.length > 1) return

      this.handleFile({ target: e.dataTransfer })
    },
    async save() {
      const blob = await this.instance.result({
        type: 'blob',
      })

      // Upload original, set scaled version in DOM
      const response = { original: blob }
      if (this.outputHeight || this.outputWidth) {
        response.scaled = await this.instance.result({
          type: 'blob',
          size: {
            width: this.inputWidth || this.outputWidth,
            height: this.inputHeight || this.outputHeight,
          },
        })
      } else {
        response.scaled = blob
      }

      this.instance.destroy()
      this.instance = null
      this.file = null
      this.$emit('image', response)
      this.dialog = false
    },
  },
}
</script>
