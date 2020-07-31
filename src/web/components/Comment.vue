<template>
  <div class="d-inline-flex flex-row mb-4 comment-container" :style="indent">
    <v-avatar class="comment-thumb">
      <v-img :src="comment.thumb"></v-img>
    </v-avatar>
    <div class="d-flex flex-column ms-3">
      <div class="d-flex flex-row comment-info">
        <nuxt-link :to="comment.profileURL" class="text-subtitle-2">
          {{ comment.profile }}
        </nuxt-link>
        <nuxt-link :to="comment.url" class="text-caption date">
          {{ comment.date }}
        </nuxt-link>
      </div>
      <div class="text-body-2">{{ comment.content }}</div>
      <v-row class="actions">
        <v-tooltip slot="append" top>
          <template #activator="{ on }">
            <span>
              <v-icon v-on="on">mdi-thumb-up-outline</v-icon>
              <small>987</small>
            </span>
          </template>
          <span>Like</span>
        </v-tooltip>
        <v-tooltip slot="append" top>
          <template #activator="{ on }">
            <span>
              <v-icon v-on="on">mdi-thumb-down-outline</v-icon>
              <small>1238</small>
            </span>
          </template>
          <span>Dislike</span>
        </v-tooltip>
        <v-tooltip slot="append" top>
          <template #activator="{ on }">
            <span>
              <v-icon v-on="on">mdi-reply-outline</v-icon>
            </span>
          </template>
          <span>Reply</span>
        </v-tooltip>
      </v-row>
      <v-row v-if="depth === 0">
        <span class="text-subtitle-2 ms-3 show-comments" @click="showChildren">
          {{ !shown ? 'View' : 'Hide' }} all replies
        </span>
      </v-row>
      <v-row
        v-if="shown && comment.children && comment.children.length"
        class="mt-4"
      >
        <comment
          v-for="child in comment.children"
          :key="child.url"
          :comment="child"
          :depth="depth + 1"
        ></comment>
      </v-row>
      <v-row v-show="loadingChildren" justify="center" align="center">
        <v-skeleton-loader
          :loading="loadingChildren"
          class="loader"
          type="list-item-avatar-two-line"
          :style="indent"
          min-width="100%"
        >
        </v-skeleton-loader>
      </v-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.comment-thumb {
  width: 48px !important;
  height: 48px !important;
  border-radius: 48px;
}

.date {
  opacity: 0.8;
}

.comment-info > * {
  margin-right: 8px;
}

.actions > * {
  margin: 8px 0px 6px 12px;
}

.comment-container {
  width: auto;
}

.show-comments {
  color: var(--v-accent-lighten1);
  cursor: pointer;
}
</style>
<script>
export default {
  name: 'Comment',
  props: {
    comment: {
      type: Object,
      default: () => {
        return {
          channel: '',
          profileURL: '',
          profile: '',
          url: '',
          date: '',
          content: '',
          thumb: '',
          children: [],
        }
      },
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      shown: false,
      loaded: false,
      loadingChildren: false,
    }
  },
  computed: {
    indent() {
      return { transform: `translate(${this.depth * 5}px)` }
    },
  },
  methods: {
    async showChildren(event) {
      if (this.loaded) {
        this.shown = !this.shown
        return
      }

      this.loadingChildren = true
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const comments = Array(5).fill(this.comment)

      this.comment.children = this.comment.children || []
      this.comment.children.push(...comments)
      this.shown = !this.shown
      this.loaded = true
      this.loadingChildren = false
    },
  },
}
</script>
