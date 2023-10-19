<script setup>
  import Chip from 'primevue/chip'

  const props = defineProps({
    json: {
      type: Array,
      default: []
    },
    field: {
      type: String,
      default: 'name'
    },    
  })
</script>

<template>
  <Chip v-for="item in props.json" :label="item[props.field]" />
</template>