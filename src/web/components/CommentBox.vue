<template>
  <v-form ref="form" v-model="valid" class="comment-box mt-2">
    <v-row>
      <v-col cols="1">
        <text-avatar :name="username" :profile="profile" :size="48" />
      </v-col>
      <v-col cols="11">
        <v-textarea
          v-model="value"
          class="ms-3"
          rows="3"
          no-resize
          filled
          label="Comment"
          :rules="rules"
          counter
          hint="Press Ctrl + Enter to save"
          @keydown="waitForFinish($event)"
          @blur="clearField"
        ></v-textarea>
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped>
.comment-box {
  max-width: 600px;
}
</style>
<script>
import TextAvatar from '~/components/TextAvatar'

export default {
  name: 'CommentBox',
  components: { TextAvatar },
  props: {
    thumb: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      value: '',
      rules: [(val) => (val?.trim().length ? true : 'Please enter a value')],
      valid: true,
    }
  },
  computed: {
    username() {
      return this.$store.state.app.userInfo.username
    },
    profile() {
      return `${this.$config.apiURL}/api/assets/user/profile?id=${this.username}.png`
    },
  },
  methods: {
    waitForFinish(e) {
      if (e.which === 13 && e.ctrlKey) {
        if (this.valid) {
          this.submitComment()
        } else {
          this.$nuxt.$emit('childEvent', {
            action: 'error',
            message: 'Please validate your input',
          })
        }
      }
    },
    submitComment() {
      const value = this.value.trim()
      this.$refs.form.reset()

      this.$emit('commentAdd', {
        value,
      })
    },
    clearField() {
      if (!this.value?.trim().length) {
        this.$nextTick(() => this.$refs.form.reset())
      }
    },
  },
}
</script>
