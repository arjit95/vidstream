<template>
  <div>
    <div ref="editableField" :class="editableClass" @click="edit">
      <slot></slot>
    </div>
    <div v-if="singleLine">
      <v-text-field
        v-show="isEditing"
        ref="editField"
        v-model="model"
        label="Edit"
        counter="80"
        hint="Press Ctrl + Enter to save"
        clearable
        @blur="cancel"
        @click:clear="cancel"
        @keydown="waitForFinish($event)"
      >
      </v-text-field>
    </div>
    <div v-else>
      <v-textarea
        v-show="isEditing"
        ref="editField"
        v-model="model"
        label="Edit"
        clearable
        hint="Press Ctrl + Enter to save"
        @blur="cancel"
        @click:clear="cancel"
        @keydown="waitForFinish($event)"
      ></v-textarea>
    </div>
  </div>
</template>
<style scoped>
.editable-container {
  position: relative;
}

.disabled {
  pointer-events: none !important;
}

.editable-container:hover {
  border: 1px solid var(--v-accent-lighten1);
  cursor: pointer;
}
</style>
<script>
export default {
  props: {
    singleLine: {
      type: Boolean,
      default: false,
    },
    model: {
      type: String,
      default: '',
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    isEditing: false,
    bModel: '',
  }),
  computed: {
    editableClass() {
      return this.editable ? 'editable-container' : 'disabled'
    },
  },
  methods: {
    waitForFinish(e) {
      if (e.which === 13 && e.ctrlKey) {
        this.finish()
      }
    },

    cancel() {
      this.isEditing = false
      this.model = this.bModel
      this.finish()
    },

    finish() {
      const firstChild = this.$refs.editableField.firstChild
      firstChild.style.display = ''

      if (!this.isEditing) {
        return
      }

      this.isEditing = false
      this.bModel = this.model // Update backup property
      this.$emit('update:model', this.model)
    },

    edit() {
      const firstChild = this.$refs.editableField.firstChild
      firstChild.style.display = 'none'
      this.isEditing = true
      this.bModel = this.model

      const textarea = this.$refs.editField.$el.querySelector('textarea,input')
      this.$nextTick(() => {
        textarea.focus()
      })
    },
  },
}
</script>
