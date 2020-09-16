<template>
  <div class="like-buttons">
    <v-tooltip slot="append" top>
      <template #activator="{ on }">
        <span>
          <v-icon slot="activator" @click="like($event)" v-on="on">{{
            likeIcon
          }}</v-icon>
          <small>{{ totalLikes }}</small>
        </span>
      </template>
      <span>{{ likes }} Like</span>
    </v-tooltip>
    <v-tooltip slot="append" top>
      <template #activator="{ on }">
        <span>
          <v-icon slot="activator" @click="dislike($event)" v-on="on">{{
            dislikeIcon
          }}</v-icon>
          <small>{{ totalDislikes }}</small>
        </span>
      </template>
      <span>{{ dislikes }} Dislike</span>
    </v-tooltip>
  </div>
</template>

<style scoped>
.like-buttons > * {
  margin-right: 6px;
}
</style>
<script>
import humanize from 'humanize-plus'

export default {
  name: 'Like',
  props: {
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    liked: {
      type: Number,
      default: -1,
    },
  },
  computed: {
    totalLikes() {
      return humanize.compactInteger(this.likes)
    },
    totalDislikes() {
      return humanize.compactInteger(this.dislikes)
    },
    likeIcon() {
      const icon = 'mdi-thumb-up'
      return this.liked === 1 ? icon : `${icon}-outline`
    },
    dislikeIcon() {
      const icon = 'mdi-thumb-down'
      return this.liked === 0 ? icon : `${icon}-outline`
    },
  },
  watch: {
    liked() {
      const mapping = {
        '0': 'Disliked',
        '1': 'Liked',
        '-1': 'Unliked',
      }

      this.$emit('change', mapping[this.liked])
    },
  },
  methods: {
    like($event) {
      $event.stopPropagation()
      $event.preventDefault()

      let liked = 1
      if (this.liked === 1) {
        this.likes--
        liked = -1
      } else {
        if (this.liked === 0) {
          this.dislikes--
        }

        this.likes++
      }

      this.liked = liked
    },
    dislike($event) {
      $event.stopPropagation()
      $event.preventDefault()

      let liked = 0
      if (this.liked === 0) {
        this.dislikes--
        liked = -1
      } else {
        if (this.liked === 1) {
          this.likes--
        }

        this.dislikes++
      }

      this.liked = liked
    },
  },
}
</script>
