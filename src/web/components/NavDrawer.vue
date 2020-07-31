<template>
  <v-navigation-drawer
    v-model="drawer"
    class="navigation-drawer"
    :expand-on-hover="$vuetify.breakpoint.mdAndUp"
    stateless
    :mini-variant="$vuetify.breakpoint.mdAndUp"
    absolute
  >
    <v-list dense nav>
      <v-list-item two-line class="px-0">
        <v-list-item-avatar>
          <img src="https://randomuser.me/api/portraits/men/81.jpg" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>Application</v-list-item-title>
          <v-list-item-subtitle>Subtext</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item v-for="item in items" :key="item.title" link>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
.navigation-drawer {
  z-index: 13 !important;
  padding-top: 48px;
}
</style>
<script>
export default {
  name: 'NavBar',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    items2: {
      type: Array,
      default: () => [],
    },
    showDrawer: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      drawer: false,
    }
  },
  mounted() {
    this.$nuxt.$on('toggleDrawer', (state) => {
      this.drawer = state
    })
  },
}
</script>
