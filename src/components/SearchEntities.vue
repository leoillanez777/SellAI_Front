<script setup>
  import { ref } from 'vue'

  defineProps({
    msg: String,
  })

  const count = ref(0)

  const selectSearch = ref({
    aggrega: [ { name: 'Filtrar por entidad', code: '$match'}],
    extra: [ { name: 'Con expresión regular', code: '$regex'}],
    cond: [
      { name: 'Ignorar mayus. y minus.', code: 'i'},
      { name: 'Comienza con', code: 'm'},
      { name: 'Termina con', code: '$'},
      { name: 'Ignorar espacios en blanco', code: 'x'},
    ],
  })
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    
  </div>

  <code>
    <!-- <Dropdown showClear v-model="data[field].aggrega" :options="selectSearch.aggrega" optionLabel="name" optionValue="code" :placeholder="'Filtrar por ' + data['alias']" class="shrink w-full" />
      <Dropdown showClear v-model="data[field].extra" :options="selectSearch.extra" optionLabel="name" optionValue="code" placeholder="Para filtrar tener en cuenta" class="w-full shrink" />
      <Dropdown showClear v-model="data[field].cond" :options="selectSearch.cond" optionLabel="name" optionValue="code" placeholder="Opciones" class="w-full shrink" /> -->
  </code>
  
</template>

