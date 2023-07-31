<script setup>
  import { ref } from 'vue';
  const props = defineProps({
    msgRequest: String,
    typeRequest: {
      type: String,
      default: ''
    },
    urlRequest: {
      type: String,
      default: ''
    },
    blobRequest: {
      type: Blob,
      default: null
    }
  })
  const message = ref(props.msgRequest);
  const type = ref(props.typeRequest);
  const objectAudio = ref(props.blobRequest);
  if (props.blobRequest === null && props.urlRequest !== '') {
    objectAudio.value = props.urlRequest
  }
</script>
<template>
  <div v-if="type === ''" alert class="relative w-full p-4 mb-4 text-xl text-white border border-solid rounded-lg bg-gradient-to-tl from-emerald-500 to-teal-400 border-emerald-300" v-html="message"></div>
  <audio v-else-if="type === 'audio'" controls preload="none" :src="objectAudio"></audio>
</template>