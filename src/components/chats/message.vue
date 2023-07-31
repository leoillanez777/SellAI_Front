<script setup>
  import { reactive } from 'vue'
  import VueWriter from "./vue-writer.vue"
  import RequestMsg from './request.vue'
  import Avatar from 'primevue/avatar'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import logoBot from '@/assets/ai48.png'

  const props = defineProps({
    message: String,
    response: Boolean,
    type: {
      type: String,
      default: ''
    },
    table: {
      type: Object,
      default() {
        return { 
          rows: [],
          columns: [{
            field: 'empty',
            header: 'Empty'
          }] 
        }
      }
    },
    blobObject: {
      type: Blob,
      default: null
    },
    url: {
      type: String,
      default: ''
    },
    urlAvatar: {
      type: String,
      default: ''
    }
  })

  const emit = defineEmits(['onfinish'])

  const resp = props.response
  const classObject = reactive({
    'order-1': !resp,
    'order-2': resp,
    'items-start': resp,
    'items-end': !resp
  })

  const finishWrite = () => {
    emit('onfinish')
  };

</script>

<template>
  <div class="space-y-2 my-4">
    <div class="flex items-end" :class="{'justify-end': !response}">
      <div :class="classObject" class="flex flex-col space-y-2 text-xs max-w-5xl mx-2">
        <div v-if="response" alert class="relative w-full p-4 mb-4 text-xl text-white border border-solid rounded-lg bg-gradient-to-tl from-[#35a4cc] to-cyan-500 border-cyan-200">
          <VueWriter :array="[message]" :iterations='1' :typeSpeed="30" @finish="finishWrite"/>
          <DataTable v-if="type==='table'" :value="table.rows" tableStyle="min-width: 50rem" showGridlines>
              <Column v-for="col of table.columns" :key="col.field" :field="col.field" :header="col.header"></Column>
          </DataTable>
        </div>
        <RequestMsg v-else :msgRequest="message" :typeRequest="type" :blobRequest="blobObject" :urlRequest="url"></RequestMsg>
      </div>
      <div>
        <div v-if="response">
          <img :src="logoBot" alt="BOT" class="inline-flex items-center justify-center w-8 h-8 mr-2 text-white transition-all duration-200 ease-in-out text-sm rounded-xl order-1"/>
        </div>
        <div v-else>
          <img v-if="urlAvatar!==''" :src="urlAvatar" alt="BOT" class="inline-flex items-center justify-center w-8 h-8 mr-2 text-white transition-all duration-200 ease-in-out text-sm rounded-xl order-2"/>
          <Avatar v-else icon="pi pi-user" class="mr-2 order-2" style="background-color:#2196F3; color: #ffffff" shape="circle"/>
        </div>
      </div>
    </div>
  </div>
</template>