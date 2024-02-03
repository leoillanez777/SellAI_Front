<script setup>
  import { ref }        from 'vue'
  import Listado        from '@/components/container/SimpleList.vue'

  const titulo = ref('Categorias')
  const methodName = ref('brand/true')
  const columns = ref([
    {field: 'name', header: 'Nombre', sort: true, export: true, style: '' },
    {field: 'description', header: 'Descripcion', sort: true, export: true, style: '' },
    {field: 'synonyms', header: 'Sinonimos', sort: true, export: true, style: '' },
    {field: 'is_active', header: 'Activo', sort: true, export: true, style: '', type: 'bool' },
  ])
  const fieldsEdit = ref([
    {name: 'name', label: 'Nombre', type: 'text', required: true, focus: true, class: 'col-span-2'},
    {name: 'description', label: 'Descripcion', type: 'area', class: 'col-span-2'},
    {name: 'synonyms', label: 'Sinonimos', type: 'chips', class: 'col-span-2'},
    {name: 'is_active', label: 'Activo', type: 'bool', class: 'pl-4'},
  ])
</script>
<template>
  <Listado :title="titulo" :columns="columns" :editFields="fieldsEdit" :nameMethod="methodName">
  </Listado>
</template>