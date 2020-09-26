<template>
  <v-avatar :color="color" :size="size">
    <v-img :src="profile">
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <span class="white--text" :style="{ fontSize: fontSize }">{{
            displayName
          }}</span>
        </v-row>
      </template>
    </v-img>
  </v-avatar>
</template>
<script>
export default {
  name: 'TextAvatar',
  props: {
    color: {
      type: String,
      default: 'accent',
    },
    profile: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 128,
    },
  },
  computed: {
    displayName() {
      return this.name.substring(0, 1)
    },
    fontSize() {
      return this.size / 2.5 + 'px'
    },
  },
}
</script>
