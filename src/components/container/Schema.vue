<script setup>
  import { ref } from 'vue'
  import InputText from 'primevue/inputtext'
  import InputNumber from 'primevue/inputnumber'
  import InputMask from 'primevue/inputmask'
  import InputSwitch from 'primevue/inputswitch'
  import Textarea from 'primevue/textarea'
  import Calendar from 'primevue/calendar'
  import Dropdown from 'primevue/dropdown'
  import Chips from 'primevue/chips'
  import ListBoxEdit from './extra/ListBoxEdit.vue'

  const props = defineProps({
    field: Object,
    data: Object
  })

  const fieldObj = ref(props.field)
  const dataObj = ref(props.data)

  const vFocus = {
    mounted: (el) => {
      if (el.getElementByTagName('INPUT').length > 0) {
        el.getElementByTagName('INPUT')[0].focus()
      }
      else {
        el.focus()
      }
    }
  }

</script>

<template>
  <div class="col-span-6">
    <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" :for="fieldObj.name">
      {{ fieldObj.label }} <span v-if="fieldObj.required" class="text-xs text-red-500">*</span>
    </label>
    <InputText v-if="fieldObj.type === 'text' && fieldObj.focus" :name="fieldObj.name" type="text" v-model="dataObj[fieldObj.name]" class="block mt-1 w-full" v-focus />
    <InputText v-else-if="fieldObj.type === 'text'" :name="fieldObj.name" type="text" v-model="dataObj[fieldObj.name]" class="block mt-1 w-full" />
    <InputNumber v-else-if="fieldObj.type === 'currency'" :name="fieldObj.name" v-model="dataObj[fieldObj.name]" mode="currency" currency="USD" locale="en-US" class="mt-1 w-full" />
    <Dropdown v-else-if="fieldObj.type === 'select'" :name="fieldObj.name" v-model="dataObj[fieldObj.name]" :options="fieldObj.select.options" :optionLabel="fieldObj.select.label" :optionValue="fieldObj.select.value" class="mt-1 w-full" />
    <Calendar v-else-if="fieldObj.type === 'date'" :name="fieldObj.name" v-model="dataObj[fieldObj.name]" :showIcon="true" dateFormat="dd/mm/yy" class="mt-1 w-full" />
    <Textarea v-else-if="fieldObj.type === 'area'" :name="fieldObj.name" v-model="dataObj[fieldObj.name]" rows="5" cols="30" class="mt-1 w-full" />
    <InputMask v-else-if="fieldObj.type === 'mask'" :mask="fieldObj.mask" v-model="dataObj[fieldObj.name]" :placeholder="fieldObj.mask" class="mt-1 w-full" />
    <InputSwitch v-else-if="fieldObj.type === 'bool'" :name="fieldObj.name" v-model="dataObj[fieldObj.name]" class="block mt-1" />
    <ListBoxEdit v-else-if="fieldObj.type === 'listedit'" :name="fieldObj.name" v-model="dataObj[fieldObj.name]" class="block mt-1" />
    <div v-else-if="fieldObj.type === 'chips'" class="block mt-1">
      <Chips :name="fieldObj.name" v-model="dataObj[fieldObj.name]" class="block mt-1 w-full"/>
      <small class="text-gray-400">Presionar "Enter" para que tome el texto.</small>
    </div>
    
  </div>
</template>