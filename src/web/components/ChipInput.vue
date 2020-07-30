<template>
  <v-combobox
    v-model="select"
    multiple
    label="Tags"
    append-icon
    chips
    deletable-chips
    class="tag-input"
    :search-input.sync="search"
  >
  </v-combobox>
</template>
<script>
export default {
  name: 'ChipInput',
  data: () => ({
    select: [],
    search: '',
  }),
}
</script>
