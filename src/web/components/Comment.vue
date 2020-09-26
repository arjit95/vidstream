<template>
  <v-row class="mb-4" :style="indent">
    <v-col cols="1">
      <text-avatar
        :profile="profileThumb"
        :name="comment.user.username"
        :size="48"
        class="mt-1"
      />
    </v-col>
    <v-col :cols="11 - depth" :class="!depth ? '' : `ms-${depth + 2}`">
      <v-row class="comment-info">
        <nuxt-link :to="profile" class="text-subtitle-2">
          {{ comment.user.name }}
        </nuxt-link>
        <nuxt-link :to="commentURL" class="text-caption date">
          {{ date }}
        </nuxt-link>
      </v-row>
      <v-row class="text-body-2">{{ comment.content }}</v-row>
      <v-row class="actions">
        <like
          :likes="comment.likes"
          :dislikes="comment.dislikes"
          :liked="comment.liked"
          @change="onCommentLike"
        />
        <v-tooltip v-if="depth === 0" slot="append" top>
          <template #activator="{ on }">
            <span @click="showReplyBox = !showReplyBox">
              <v-icon v-on="on">mdi-reply-outline</v-icon>
            </span>
          </template>
          <span>Reply</span>
        </v-tooltip>
      </v-row>
      <v-row v-if="depth === 0 && shouldShowReplies">
        <span
          class="text-subtitle-2 ms-1 mt-2 show-comments"
          @click="showChildren"
        >
          {{ !comment.showReplies ? 'View' : 'Hide' }} all replies
        </span>
      </v-row>
      <comment-box
        v-if="showReplyBox"
        :thumb="comment.thumb"
        @commentAdd="onCommentAdd"
      />
      <v-col
        v-if="comment.children && comment.showReplies && shouldShowReplies"
      >
        <comment
          v-for="child in comment.children"
          :key="child.id"
          :comment="child"
          :depth="depth + 1"
          @commentAdd="onCommentAdd"
          @like="onCommentLike"
        />
      </v-col>
      <v-row v-show="loadingChildren" justify="center" align="center">
        <v-skeleton-loader
          :loading="loadingChildren"
          class="loader"
          type="list-item-avatar-two-line"
          min-width="100%"
        />
      </v-row>
    </v-col>
  </v-row>
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
  margin: 8px 0px 6px 4px;
}

.show-comments {
  color: var(--v-accent-lighten1);
  cursor: pointer;
}
</style>
<script>
import Humanize from 'humanize-duration'
import CommentBox from '~/components/CommentBox'
import TextAvatar from '~/components/TextAvatar'

export default {
  name: 'Comment',
  components: { CommentBox, TextAvatar },
  props: {
    comment: {
      type: Object,
      default: () => ({
        id: '',
        timestamp: '',
        content: '',
        user: {
          username: '',
        },
        children: undefined,
        showReplies: false,
      }),
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loadingChildren: false,
      showReplyBox: false,
      apiURL: this.$config.apiURL,
    }
  },
  computed: {
    shouldShowReplies() {
      return this.comment.children !== null
    },

    indent() {
      if (!this.depth) {
        return ''
      }

      return `transform: translate(-${this.depth + 5}px)`
    },
    profileThumb() {
      return `${this.apiURL}/api/assets/user/profile?id=${this.comment.user.username}`
    },
    profile() {
      return `/profile/${this.comment.user.username}`
    },
    commentURL() {
      return `?comment=${this.comment.id}`
    },
    date() {
      return (
        Humanize(Date.now() - new Date(this.comment.timestamp).getTime(), {
          largest: 1,
        }) + ' ago'
      )
    },
  },
  watch: {
    'comment.children'() {
      this.loadingChildren = false
      if (this.comment.children) {
        this.comment.showReplies = !this.comment.showReplies
      }
    },
  },
  methods: {
    onCommentAdd(info) {
      this.$emit('commentAdd', { ...info, id: this.comment.id })
    },

    onCommentLike(state) {
      if (typeof state === 'object') {
        this.$emit('like', state)
        return
      }

      this.$emit('like', { state, id: this.comment.id })
    },

    showChildren(event) {
      if (this.comment.children?.length) {
        this.comment.showReplies = !this.comment.showReplies
        return
      }

      this.loadingChildren = true
      this.$emit('commentRequest', this.comment.id)
    },
  },
}
</script>
