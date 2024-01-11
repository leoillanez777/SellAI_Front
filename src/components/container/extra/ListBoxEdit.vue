<script setup>
  import { ref } from 'vue';

  import Listbox from 'primevue/listbox';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';
  
  const props = defineProps(['modelValue']);
  const emit = defineEmits(['update:modelValue']);

  const value = ref('');
  const values = ref(props.modelValue);

  const addNewValue = () => {
    values.value.push(value.value);
    value.value = '';
    emit('update:modelValue', values.value);
  };

  
</script>

<template>
  <div class="grid grid-cols-6 gap-2">
    <div class="col-span-4">
      <InputText type="text" v-model="value" class="p-inputtext-sm" />
    </div>
    <div class="col-span-2">
      <Button label="Agregar" icon="pi pi-check" @click="addNewValue" class="p-button-sm" />
    </div>
    <div class="col-span-6">
      <Listbox v-model="value" :options="values" style="width:15rem" />
    </div>
  </div>
</template>