<template>
  <div>
    <div ref="editableField" class="editable-container" @click="edit">
      <slot></slot>
    </div>
    <div v-if="singleLine">
      <v-text-field
        v-show="isEditing"
        ref="editField"
        v-model="model"
        label="Edit"
        @blur="finish"
      >
      </v-text-field>
    </div>
    <div v-else>
      <v-textarea
        v-show="isEditing"
        ref="editField"
        v-model="model"
        label="Edit"
        @blur="finish"
      ></v-textarea>
    </div>
  </div>
</template>
<style scoped>
.editable-container {
  position: relative;
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
  },
  data: () => ({
    isEditing: false,
  }),
  methods: {
    finish() {
      const firstChild = this.$refs.editableField.firstChild
      firstChild.style.display = ''
      this.isEditing = false
    },

    edit() {
      const firstChild = this.$refs.editableField.firstChild
      firstChild.style.display = 'none'
      this.isEditing = true
      const textarea = this.$refs.editField.$el.querySelector('textarea,input')
      this.$nextTick(() => {
        textarea.focus()
      })
    },
  },
}
</script>
