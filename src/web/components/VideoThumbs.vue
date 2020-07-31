<template>
  <div :class="horizontal ? 'horizontal' : 'vertical'">
    <video-thumb
      v-for="item in videos"
      :key="item.name"
      class="thumb"
      :video="item"
    ></video-thumb>
    <v-col v-show="!isLoaded" sm="12" :md="horizontal ? 4 : 12">
      <v-skeleton-loader
        :loading="!isLoaded"
        tile
        type="list-item-avatar-three-line"
      >
      </v-skeleton-loader>
    </v-col>
  </div>
</template>

<style lang="scss" scoped>
.horizontal {
  display: flex;
  flex-direction: row;
}

.vertical {
  display: flex;
  flex-direction: column;
}

.horizontal .thumb:not(:first-of-type) {
  padding-left: 16px;
}

.vertical .thumb {
  padding-bottom: 16px;
}
</style>

<script>
import VideoThumb from '~/components/VideoThumb'

export default {
  components: { VideoThumb },
  props: {
    horizontal: {
      default: false,
      type: Boolean,
    },
    vertical: {
      default: true,
      type: Boolean,
    },
    videos: {
      default: () => [],
      type: Array,
    },
  },
  data: () => {
    return {
      _isLoaded: false,
    }
  },
  computed: {
    isLoaded: {
      get() {
        return this._isLoaded || this.videos.length > 0
      },

      set(val) {
        this._isLoaded = val
      },
    },
  },
  watch: {
    videos() {
      this.isLoading = this.videos.length === 0
    },
  },
}
</script>
