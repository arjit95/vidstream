<template>
  <v-col align="center">
    <v-img src="/vuetify-logo.svg" aspect-ratio="2" height="125" contain />
    <h1 v-if="error.statusCode === 404">
      {{ pageNotFound }}
    </h1>
    <h1 v-if="error.statusCode === 404">
      {{ error.message }}
    </h1>
    <h1 v-else>
      {{ otherError }}
    </h1>
    <span style="cursor: pointer;" @click="$router.go(-1)">
      Go Back
    </span>
  </v-col>
</template>

<script>
export default {
  layout: 'simple',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred',
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title,
    }
  },
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
