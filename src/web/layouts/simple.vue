<template>
  <v-app>
    <v-container fill-height fluid>
      <nuxt />
    </v-container>
  </v-app>
</template>
<script>
export default {
  layout: 'empty',
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
  mounted() {
    this.$vuetify.theme.dark = this.darkMode
  },
}
</script>
