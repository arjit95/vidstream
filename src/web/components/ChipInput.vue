<template>
  <v-combobox
    v-model="select"
    multiple
    :label="label"
    append-icon
    chips
    deletable-chips
    class="tag-input"
    :search-input.sync="search"
    :items="items"
  >
  </v-combobox>
</template>
<script>
export default {
  name: 'ChipInput',
  props: {
    items: {
      type: Array,
      default: undefined,
    },
    label: {
      type: String,
      default: 'Tags',
    },
  },
  data: () => ({
    select: [],
    search: '',
  }),
}
</script>
