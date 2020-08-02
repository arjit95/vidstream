<template>
  <v-container class="pl-sm-1 pr-sm-1" fluid>
    <v-row class="mb-4 description-container">
      <v-col cols="1">
        <v-avatar>
          <v-img
            class="description-thumb"
            src="https://cdn.vuetifyjs.com/images/cards/store.jpg"
          ></v-img>
        </v-avatar>
      </v-col>
      <v-col class="pt-0" cols="8">
        <div class="text-subtitle-1">Channel name</div>
        <div class="text-caption mb-4 sub-count">12345 subscribers</div>
        <div class="text-body-2">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum
        </div>
      </v-col>
      <v-col cols="3">
        <v-btn class="mb-4" tile color="accent" small>
          <v-icon left>mdi-pencil</v-icon> Subscribe
        </v-btn>
        <div class="categories mb-4 text-body-2">
          Categories: <span>Cat1</span> <span>Cat2</span>
        </div>
        <div class="tags text-body-2">
          Tags: <span>#tag1</span> <span>#tag2</span>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.sub-count {
  opacity: 0.9;
}
</style>
<script>
export default {
  name: 'VideoDescription',
}
</script>
