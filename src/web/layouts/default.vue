<template>
  <v-app :is-dark="darkMode">
    <nav-drawer :items="items" :items2="items2"></nav-drawer>

    <v-app-bar
      class="app-bar"
      clipped-left
      app
      elevate-on-scroll
      color="transparent"
      dense
    >
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
              v-model="searchQuery"
              class="col-6"
              :loading="isLoading"
              :items="searchResults"
              :search-input.sync="search"
              flat
              hide-details
              label="Search..."
              solo-inverted
              hide-no-data
            >
            </v-autocomplete>
          </v-scale-transition>
          <v-btn icon @click="toggleSearch">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          <v-btn icon>
            <nuxt-link to="/login"><v-icon>mdi-account</v-icon></nuxt-link>
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
</style>
<script>
import _ from 'lodash'
import NavDrawer from '~/components/NavDrawer'

const Cookie = process.client ? require('js-cookie') : undefined
export default {
  name: 'App',
  components: {
    NavDrawer,
  },
  data: () => ({
    searchQuery: null,
    search: null,
    searchResults: [],
    isLoading: false,
    drawer: false,
    isSearchShown: false,
    items: [
      { icon: 'mdi-trending-up', text: 'Most Popular' },
      { icon: 'mdi-youtube-subscription', text: 'Subscriptions' },
      { icon: 'mdi-history', text: 'History' },
      { icon: 'mdi-playlist-play', text: 'Playlists' },
      { icon: 'mdi-clock', text: 'Watch Later' },
    ],
    items2: [
      { picture: 28, text: 'Joseph' },
      { picture: 38, text: 'Apple' },
      { picture: 48, text: 'Xbox Ahoy' },
      { picture: 58, text: 'Nokia' },
      { picture: 78, text: 'MKBHD' },
    ],
  }),
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
    search: _.debounce(async function (val) {
      if (!val) return

      this.isLoading = true
      await new Promise((resolve) => setTimeout(resolve, 3000))
      this.searchResults = ['hello', 'world']
      this.isLoading = false
    }, 1000),
  },
  mounted() {
    this.$nuxt.$on('childEvent', this.handleEvent.bind(this))
    /**
     * Hack: Waiting for dom to completely render
     * TODO: Remove setTimeout call
     * https://github.com/vuetifyjs/vuetify/issues/9453
     *
     **/
    setTimeout(() => {
      this.$vuetify.theme.dark = this.darkMode
    }, 500)
  },
  methods: {
    handleEvent(event) {
      if (event.action === 'toggle-lights') {
        event.state
          ? this.$refs.overlay.classList.remove('lights-off')
          : this.$refs.overlay.classList.add('lights-off')
      }
    },
    toggleSearch() {
      this.isSearchShown = !this.isSearchShown
    },
    doLogout() {
      Cookie.remove('token')
      this.$store.commit('auth/setAuth', null)
    },
    toggleDrawer() {
      this.drawer = !this.drawer
      this.$nuxt.$emit('toggleDrawer', this.drawer)
    },
  },
}
</script>
