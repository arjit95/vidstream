<template>
  <v-navigation-drawer v-model="drawer" app clipped>
    <v-list dense>
      <v-list-item v-for="item in items" :key="item.text" link>
        <v-list-item-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ item.text }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-subheader class="mt-4 grey--text text--darken-1"
        >SUBSCRIPTIONS</v-subheader
      >
      <v-list>
        <v-list-item v-for="item in items2" :key="item.text" link>
          <v-list-item-avatar>
            <img
              :src="`https://randomuser.me/api/portraits/men/${item.picture}.jpg`"
              alt=""
            />
          </v-list-item-avatar>
          <v-list-item-title v-text="item.text"></v-list-item-title>
        </v-list-item>
      </v-list>
      <v-list-item class="mt-4" link>
        <v-list-item-action>
          <v-icon color="grey darken-1">mdi-plus-circle-outline</v-icon>
        </v-list-item-action>
        <v-list-item-title class="grey--text text--darken-1"
          >Browse Channels</v-list-item-title
        >
      </v-list-item>
      <v-list-item link>
        <v-list-item-action>
          <v-icon color="grey darken-1">mdi-cog</v-icon>
        </v-list-item-action>
        <v-list-item-title class="grey--text text--darken-1"
          >Manage Subscriptions</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

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
    hideDrawer: {
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
