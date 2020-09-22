<template>
  <div :class="horizontal ? 'horizontal' : 'vertical'">
    <video-thumb
      v-for="item in videos"
      :key="item.name"
      :class="dense ? 'dense thumb' : 'thumb'"
      :video="item"
      :horizontal="horizontal"
      :vertical="vertical"
      :dense="dense"
    ></video-thumb>
    <v-col v-show="!isLoaded" sm="12" :md="horizontal ? 4 : 12">
      <v-skeleton-loader
        :loading="!isLoaded"
        tile
        :type="horizontal ? 'card-avatar' : 'list-item-avatar-three-line'"
      >
      </v-skeleton-loader>
    </v-col>
  </div>
</template>

<style lang="scss" scoped>
@import '~vuetify/src/styles/styles.sass';

@media #{map-get($display-breakpoints, 'sm-and-down')} {
  .horizontal {
    flex-direction: column;

    > * {
      width: 45%;
    }
  }
}

@media #{map-get($display-breakpoints, 'md-and-up')} {
  .horizontal {
    > * {
      width: 23%;
    }

    > .dense {
      width: 19% !important;
      height: 230px !important;
    }
  }
}

.horizontal {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;

  > * {
    margin: 5px;
    height: 240px;
  }

  .thumb:not(:first) {
    padding-left: 16px;
  }
}

.vertical {
  display: flex;
  flex-direction: column;

  .thumb {
    padding-bottom: 16px;
  }
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
      default: false,
      type: Boolean,
    },
    videos: {
      default: () => [],
      type: Array,
    },
    dense: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: true,
      type: Boolean,
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
        return this._isLoaded || this.videos.length > 0 || !this.loading
      },

      set(val) {
        this._isLoaded = val
      },
    },
  },
  watch: {
    videos() {
      this._isLoaded = this.videos.length > 0
    },
  },
}
</script>
