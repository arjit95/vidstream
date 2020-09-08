<template>
  <v-container class="px-0" fluid>
    <nuxt-link v-for="item in items" :key="item.title" :to="item.href">
      <v-list-item link>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </nuxt-link>
  </v-container>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
}
</script>
