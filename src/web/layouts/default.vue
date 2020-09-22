<template>
  <v-app :is-dark="darkMode">
    <nav-drawer></nav-drawer>

    <v-app-bar class="app-bar" clipped-left app fixed elevate-on-scroll dense>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      <v-icon class="mx-4" large>
        mdi-theater
      </v-icon>
      <v-toolbar-title class="mr-12 align-center">
        <nuxt-link to="/"><span class="title">Vidstream</span></nuxt-link>
      </v-toolbar-title>
      <v-col>
        <v-row justify="end">
          <v-scale-transition origin="right center 0">
            <v-autocomplete
              v-show="isSearchShown"
              v-model="searchModel"
              :loading="isLoading"
              :items="searchResults"
              :search-input.sync="search"
              flat
              hide-details
              label="Search..."
              solo-inverted
              hide-no-data
              item-text="title"
              item-value="id"
              return-object
            >
              <template v-slot:item="{ item }">
                <template>
                  <v-list-item-avatar>
                    <v-img :src="item.avatar" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="search-title">{{
                      item.title
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="search-subtitle">{{
                      item.subtitle
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </template>
            </v-autocomplete>
          </v-scale-transition>
          <v-btn icon @click="toggleSearch">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          <v-menu
            :close-on-content-click="false"
            bottom
            left
            transition="scale-transition"
            origin="top right"
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-card class="mx-auto">
              <v-list>
                <v-list-item>
                  <v-list-item-action>
                    <v-switch v-model="darkMode"></v-switch>
                  </v-list-item-action>
                  <v-list-item-title>Dark Mode</v-list-item-title>
                </v-list-item>
                <div v-if="this.$store.state.auth.token">
                  <v-list-item
                    v-for="link in registeredNavLinks"
                    :key="link.title"
                    link
                    @click="link.click"
                  >
                    <v-list-item-action>
                      <v-icon> {{ link.icon }} </v-icon>
                    </v-list-item-action>
                    <v-list-item-title> {{ link.title }} </v-list-item-title>
                  </v-list-item>
                </div>
                <div v-else>
                  <v-list-item
                    v-for="link in anonNavLinks"
                    :key="link.title"
                    link
                    @click="link.click"
                  >
                    <v-list-item-action>
                      <v-icon> {{ link.icon }} </v-icon>
                    </v-list-item-action>
                    <v-list-item-title> {{ link.title }} </v-list-item-title>
                  </v-list-item>
                </div>
              </v-list>
            </v-card>
          </v-menu>
        </v-row>
      </v-col>
    </v-app-bar>

    <v-main>
      <v-responsive class="fill-height">
        <div ref="overlay" class="overlay"></div>
        <nuxt />
      </v-responsive>
    </v-main>

    <v-snackbar v-model="errorDisplay" timeout="2000" top right>
      {{ errorText }}

      <template v-slot:action="{ attrs }">
        <v-btn color="accent" text v-bind="attrs" @click="errorDisplay = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style lang="scss">
#app a {
  color: inherit;
  text-decoration: none;
}
</style>

<style lang="scss" scoped>
.app-bar {
  z-index: 99999 !important;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;
  visibility: hidden;
}

.lights-off {
  background: rgba(0, 0, 0, 0.9);
  visibility: visible;
}

.search-result .search-subtitle {
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
<script>
import _ from 'lodash'
import humanize from 'humanize-plus'
import NavDrawer from '~/components/NavDrawer'
import Token from '~/plugins/Token'

export default {
  name: 'App',
  components: {
    NavDrawer,
  },
  async middleware({ $sdk, store, error }) {
    const token = new Token(store.state.auth.expiry, store)
    token.setRefreshHandler(() => $sdk.Auth.refresh())
    token.setLogoutHandler(async () => {
      await $sdk.Auth.logout()
      window.location.href = '/'
    })

    if (!store.state.app.userInfo.isLoggedIn) {
      return
    }

    const err = await token.init()
    if (err) {
      return error({
        statusCode: 500,
        message: err,
      })
    }
  },

  data() {
    return {
      searchModel: null,
      search: null,
      searchResults: [],
      isLoading: false,
      drawer: null,
      isSearchShown: false,
      errorText: null,
      errorDisplay: false,
      registeredNavLinks: [
        {
          title: 'Logout',
          click: this.doLogout,
          icon: 'mdi-exit-to-app',
        },
      ],
      anonNavLinks: [
        {
          title: 'Login',
          click: () => this.$router.push('/login'),
          icon: 'mdi-account',
        },
      ],
    }
  },
  computed: {
    darkMode: {
      get() {
        return this.$store.state.app.darkMode
      },

      set(val) {
        this.$store.commit('app/toggleDarkMode', val)
        this.$vuetify.theme.dark = val
      },
    },
  },
  watch: {
    searchModel(val) {
      if (!val) {
        return
      }

      this.$router.push(val.url)
    },

    search: _.debounce(async function (val) {
      if (!val || val?.trim().length < 3) return this.resetSearchResults()

      this.isLoading = true
      const response = await this.$sdk.Recommendations.search(val)
      if (response.error) {
        this.$nuxt.$emit('childEvent', {
          action: 'error',
          message: response.error,
        })

        this.resetSearchResults()
        return
      }

      if (this.search !== val) {
        return
      }

      this.searchResults = response.results.map((res) => {
        switch (res.type) {
          case 'video':
            res.avatar = `${this.$config.apiURL}/api/assets/video/image/${res.id}/poster.png`
            res.url = `/watch/${res.id}`
            break
          case 'user':
            res.avatar = `${this.$config.apiURL}/api/assets/user/profile?id=${res.id}.png`
            res.url = `/profile/${res.id}`
            break
          case 'channel':
            res.avatar = `${this.$config.apiURL}}/api/assets/channel/banner?id=${res.id}.png`
            res.url = `/channel/${res.id}`
            break
        }

        res.subtitle = humanize.titleCase(res.type)
        return res
      })

      this.isLoading = false
    }, 1000),
  },
  mounted() {
    this.$nuxt.$on('childEvent', this.handleEvent.bind(this))
    this.$vuetify.theme.dark = this.darkMode
  },
  methods: {
    resetSearchResults() {
      this.searchResults = []
    },

    handleEvent(event) {
      switch (event.action) {
        case 'toggle-lights':
          event.state
            ? this.$refs.overlay.classList.remove('lights-off')
            : this.$refs.overlay.classList.add('lights-off')
          break
        case 'error':
        case 'info':
          this.errorDisplay = true
          this.errorText = event.message
          break
      }
    },
    toggleSearch() {
      this.isSearchShown = !this.isSearchShown
    },
    async doLogout() {
      await this.$sdk.Auth.logout()
      window.location.href = '/'
    },
    toggleDrawer() {
      this.drawer = !this.drawer
      this.$nuxt.$emit('toggleDrawer', this.drawer)
    },
  },
}
</script>
