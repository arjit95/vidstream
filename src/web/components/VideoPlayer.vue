<template>
  <v-container fluid>
    <v-row ref="playerContainer" class="player-container">
      <v-col sm="12" offset-md="2" md="8" style="position: relative;">
        <v-row
          v-show="!isLoading"
          ref="videoContainer"
          class="video-container"
          justify="center"
          align-md="center"
        >
          <video
            id="video"
            ref="videoPlayer"
            class="video-js vjs-default-skin"
            controls
          ></video>
          <v-row
            v-show="!isLoading"
            ref="playerInfo"
            align="center"
            class="video-info"
          >
            <v-col class="video-meta" md="8">
              <v-col id="video-name">
                <p class="channel">Nature</p>
                <p class="title">Big Buck bunny trailer</p>
                <p class="views">3.2M Views</p>
              </v-col>
              <v-col class="video-stats d-flex flex-row">
                <v-tooltip slot="append" top>
                  <template #activator="{ on }">
                    <span>
                      <v-icon slot="activator" @click="like" v-on="on"
                        >mdi-thumb-up-outline</v-icon
                      >
                      <small>987</small>
                    </span>
                  </template>
                  <span>Like</span>
                </v-tooltip>
                <v-tooltip slot="append" top>
                  <template #activator="{ on }">
                    <span>
                      <v-icon slot="activator" @click="dislike" v-on="on"
                        >mdi-thumb-down-outline</v-icon
                      >
                      <small>1238</small>
                    </span>
                  </template>
                  <span>Dislike</span>
                </v-tooltip>
                <v-tooltip slot="append" top>
                  <template #activator="{ on }">
                    <span>
                      <v-icon slot="activator" @click="toggleLights" v-on="on"
                        >mdi-lightbulb-{{
                          lights ? 'off' : 'on'
                        }}-outline</v-icon
                      >
                      <small>Turn {{ lights ? 'off' : 'on' }} lights</small>
                    </span>
                  </template>
                  <span>Toggle focus on player</span>
                </v-tooltip>
              </v-col>
            </v-col>
          </v-row>
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
  display: flex;
  justify-content: center;
  align-items: center;
  .vjs-control-bar {
    z-index: 9999;
  }

  .vjs-big-play-button {
    border-radius: 200px;
    width: 3em;
    height: 3em;
    z-index: 9999;
    position: relative;
    line-height: 3em;
    margin-left: 25%;
    border-color: transparent;
    z-index: 12;
    background-color: rgba(43, 51, 63, 0.9);
  }
}

.player-container:fullscreen {
  .vjs-control-bar {
    bottom: 1em !important;
  }
}
</style>

<style lang="scss" scoped>
@import '~vuetify/src/styles/styles.sass';

.loader,
#video {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 10;
}
.accent-glow {
  box-shadow: 0px 0px 16px var(--v-accent-lighten2);
}

.vjs-has-started + .video-info {
  height: calc(96% - 2em);
}

.video-info {
  position: absolute;
  left: 1.4%;
  top: 2.5%;
  width: 100%;
  height: 95%;
  background: rgb(0, 0, 0);
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  transition: all 0.5s;
  z-index: 11;
}

.video-info,
.video-info button {
  color: white;
}

.player-container:fullscreen {
  margin: 0;
  padding: 0;

  > * {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    margin: 0;
    flex: 0 0 auto;
  }

  #video {
    height: 100vh;
  }

  .video-info {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .vjs-has-started + .video-info {
    height: calc(100% - 1.7em) !important;
  }

  .video-meta {
    width: 100%;
    margin: 0;
  }
}

@media #{map-get($display-breakpoints, 'sm-and-down')} {
  .player-container {
    height: 50vh;
  }
}

@media #{map-get($display-breakpoints, 'md-and-up')} {
  .player-container {
    height: 70vh;
  }
}

.player-container {
  .video-container {
    height: 100%;
  }

  .video-meta {
    align-items: flex-start;
    width: 60%;
    margin-left: 24px;

    .title {
      font-size: 150% !important;
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

    > * {
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
      if (this.player.paused()) return

      info.classList.add('d-none')
    }, 2500)
  }

  addListeners() {
    const player = this.player
    const clickHandler = () => {
      player.paused() && !player.ended() ? player.play() : player.pause()
    }

    this.info.addEventListener('click', clickHandler)
    this.video.addEventListener('mousemove', this.hideInfoScreen.bind(this))
    this.info.addEventListener('mousemove', this.hideInfoScreen.bind(this))

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
      this.isLoading = false
    })

    Promise.resolve(this.onReady(this.player)).then(() => {
      this.player.hlsQualitySelector()
    })
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
    like() {},
    dislike() {},
  },
}
</script>
