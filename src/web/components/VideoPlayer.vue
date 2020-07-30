<template>
  <v-container fluid>
    <v-row ref="playerContainer" class="player-container">
      <v-col sm="12" offset-md="2" md="8" style="position: relative;">
        <v-row v-show="!isLoading" justify="center" align="center">
          <video
            id="video"
            ref="videoPlayer"
            class="video-js vjs-default-skin"
            controls
          ></video>
        </v-row>
        <v-row
          v-show="!isLoading"
          ref="playerInfo"
          justify="center"
          align="center"
          class="video-info"
        >
          <v-col class="video-meta" md="8">
            <v-col id="video-name">
              <p class="channel">Nature</p>
              <p class="title">Big Buck bunny trailer</p>
              <p class="views">3,015,263</p>
            </v-col>
            <v-col class="video-stats d-flex flex-row">
              <v-list-item-action-text class="likes"
                ><v-icon>mdi-thumb-up-outline</v-icon>
                987</v-list-item-action-text
              >
              <v-list-item-action-text class="dislikes">
                <v-icon>mdi-thumb-down-outline</v-icon> 1235
              </v-list-item-action-text>
              <v-list-item-action-text class="lights" @click="toggleLights">
                <v-icon
                  >mdi-lightbulb-{{ lights ? 'off' : 'on' }}-outline</v-icon
                >
                Turn {{ lights ? 'off' : 'on' }} lights
              </v-list-item-action-text>
            </v-col>
          </v-col>
        </v-row>
        <v-row justify="center" align="center">
          <v-skeleton-loader
            v-show="isLoading"
            :loading="isLoading"
            class="loader"
            type="card"
          >
          </v-skeleton-loader>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
#video {
  .vjs-control-bar {
    z-index: 9999;
  }

  .vjs-big-play-button {
    right: 24%;
    top: 38%;
    left: auto;
    bottom: auto;
    border: 0;
    border-radius: 200px;
    width: 3em;
    height: 3em;
    z-index: 9999;
    position: absolute;
    line-height: 3em;
  }
}
</style>

<style lang="scss" scoped>
.loader,
#video {
  width: 100%;
  height: 70vh;
  z-index: 10;
}

.accent-glow {
  box-shadow: 0px 0px 16px var(--v-accent-lighten2);
}

.video-info {
  position: absolute;
  left: 1%;
  top: 2%;
  width: 100%;
  height: 96%;
  background: rgb(0, 0, 0);
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  transition: all 0.5s;
  z-index: 11;
}

.video-info:-moz-full-screen {
  position: absolute;
}
.video-info:-webkit-full-screen {
  position: absolute;
}
.video-info:-ms-fullscreen {
  position: absolute;
}
.video-info:fullscreen {
  position: absolute;
}

.player-container {
  .video-meta {
    align-items: flex-start;
    width: 60%;
    margin-left: 24px;

    .title {
      font-size: 42px !important;
      margin-bottom: 12px;
      font-weight: bold;
      margin-top: 0;
      line-height: 1.1em;
    }
    .views {
      font-size: 16px;
      margin-bottom: 0;
      margin-top: 0;
    }
  }

  .video-stats {
    align-items: center;

    .likes,
    .dislikes,
    .lights {
      cursor: pointer;
      margin: 16px 8px 8px 0;
    }
  }
}
</style>

<script>
import videojs from 'video.js'
import 'videojs-contrib-quality-levels'
import 'videojs-hls-quality-selector'
import 'videojs-vtt-thumbnails'
import 'video.js/dist/video-js.css'
import _ from 'lodash'

class PlayerUtils {
  constructor({ player, info, video }) {
    this.player = player
    this.info = info
    this.video = video
    this.debouncedHide = _.debounce(() => {
      info.classList.add('d-none')
    }, 2500)
  }

  addListeners() {
    const player = this.player
    this.info.addEventListener('click', () => {
      player.paused() && !player.ended() ? player.play() : player.pause()
    })

    this.video.addEventListener('mousemove', this.hideInfoScreen.bind(this))
    player.on('playing', () => {
      this.info.classList.add('d-none')
      player.bigPlayButton.hide()
    })

    player.on('pause', () => {
      if (player.seeking()) {
        return
      }

      this.info.classList.remove('d-none')
    })

    this.hideInfoScreen()
  }

  hideInfoScreen() {
    if (this.player.paused()) return

    this.info.classList.remove('d-none')
    this.debouncedHide()
  }
}

export default {
  name: 'VideoPlayer',
  props: {
    options: {
      type: Object,
      default() {
        return {}
      },
    },
    poster: {
      type: String,
      default: '',
    },
    onReady: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      player: null,
      isLoading: true,
      lights: true,
    }
  },

  mounted() {
    setTimeout(async () => {
      this.isLoading = false
      this.player = videojs(this.$refs.videoPlayer, this.options)

      this.player.on('loadstart', () => {
        const playerContainer = this.$refs.playerContainer
        this.player.requestFullscreen = playerContainer.requestFullscreen.bind(
          playerContainer
        )
        this.player.exitFullscreen = document.exitFullscreen.bind(document)
        this.player.isFullscreen = () => document.fullscreen

        const utils = new PlayerUtils({
          player: this.player,
          info: this.$refs.playerInfo,
          video: this.$refs.videoPlayer,
        })

        utils.addListeners()
      })

      await this.onReady(this.player)
      this.player.hlsQualitySelector()
    }, 1000)
  },

  beforeDestroy() {
    this.player && this.player.dispose()
  },

  methods: {
    toggleLights(event) {
      event.stopPropagation()
      this.lights = !this.lights
      if (this.lights) {
        this.player.el().classList.remove('accent-glow')
      } else {
        this.player.el().classList.add('accent-glow')
      }

      this.$nuxt.$emit('childEvent', {
        action: 'toggle-lights',
        state: this.lights,
      })
    },
  },
}
</script>
