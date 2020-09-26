<template>
  <v-form v-model="valid">
    <div ref="editableField" :class="editableClass" @click="edit">
      <slot></slot>
    </div>
    <div v-if="singleLine">
      <v-text-field
        v-show="isEditing"
        ref="editField"
        v-model="editableModel"
        label="Edit"
        :counter="maxlength"
        hint="Press Ctrl + Enter to save"
        clearable
        :maxlength="maxlength"
        :rules="rules"
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
        v-model="editableModel"
        label="Edit"
        clearable
        hint="Press Ctrl + Enter to save"
        no-resize
        rows="4"
        :counter="maxlength"
        :maxlength="maxlength"
        :rules="rules"
        @blur="cancel"
        @click:clear="cancel"
        @keydown="waitForFinish($event)"
      ></v-textarea>
    </div>
  </v-form>
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
    rules: {
      type: Array,
      default: () => [],
    },
    maxlength: {
      type: Number,
      default: 50,
    },
  },
  data() {
    return {
      isEditing: false,
      bModel: '',
      valid: true,
      editableModel: this.model,
    }
  },
  computed: {
    editableClass() {
      return this.editable ? 'editable-container' : 'disabled'
    },
  },
  methods: {
    waitForFinish(e) {
      if (e.which === 13 && e.ctrlKey) {
        if (this.valid) {
          this.finish()
        } else {
          this.cancel()
        }
      }
    },

    cancel() {
      this.isEditing = false
      this.editableModel = this.bModel
      this.finish()
    },

    finish() {
      const firstChild = this.$refs.editableField.firstChild
      firstChild.style.display = ''

      if (!this.isEditing) {
        return
      }

      this.isEditing = false
      this.bModel = this.editableModel.trim() // Update backup property
      this.$emit('update:model', this.bModel)
    },

    edit() {
      const firstChild = this.$refs.editableField.firstChild
      firstChild.style.display = 'none'
      this.isEditing = true
      this.bModel = this.editableModel

      const textarea = this.$refs.editField.$el.querySelector('textarea,input')
      this.$nextTick(() => {
        textarea.focus()
      })
    },
  },
}
</script>
