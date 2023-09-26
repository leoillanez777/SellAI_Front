<script setup>
  import { ref, nextTick } from 'vue'
  import { useSettingStore } from '@/data'
  import InputText from 'primevue/inputtext'
  import Button from 'primevue/button'
  import OverlayPanel from 'primevue/overlaypanel';
  import Msg from '@/components/chats/message.vue'
  import Recorder from '@/components/audio/recorder.vue'
  
  const storeSetting = useSettingStore();
  const refScroller = ref() // Una referencia para controlar el panel de desplazamiento
  const refDivScroll = ref() // Una referencia para controlar el desplazamiento del panel
  const refOpAudio = ref() // Una referencia para controlar el panel de grabación de audio
  const messages = ref([{id: -1, message: 'Hola...si necesitas ayuda escribe: "Ayuda"', response: true}]) // Almacena los mensajes en el chat
  const typeMsg = ref("") // Tipo de mensaje (texto o tabla)
  const tableMsg = ref([]) // Para almacenar los datos de una tabla
  const txtMsg = ref('') // Texto del mensaje que se está escribiendo

  // //--------------------------------------------------- // //
  // // SECTOR FUNCTION
  // //--------------------------------------------------- // //
  const bottomScroll = () => {
    refDivScroll.value.scrollIntoView({behavior: 'smooth'})
  };

  // Abre panel de audio.
  const toggleAudio = (event) => {
    refOpAudio.value.toggle(event);
  }

  // Respuesta luego de que graba el audio.
  const callbackAudio = async (resp, files) => {
    console.log('Respuesta de Call Back AUDIO>>>>> ', resp);
    console.log('Files: ', files);
    typeMsg.value = 'audio';
    messages.value.push({ id: msgId.value++, message: txtMsg.value, response: false, url: files.url }); // Se agrega el mensaje a la lista de mensajes
    await responseInterpreter(resp.resp);
  }
</script>
<template>
  <div class="container">

    <div ref="refScroller" v-show="messages.length>0" class="flex flex-col overflow-y-visible mr-4 sm:mr-0">
      <!-- Section Messages -->
      <Msg v-for="msg in messages" :key="msg.id" :message="msg.message" 
        :response="msg.response" :type="typeMsg" :table="tableMsg" :url="msg.url"
        @onfinish="bottomScroll">
      </Msg>
      <div ref="refDivScroll" class="h-16 mt-16 text-sky-50">....</div>
    </div>

    <!-- Section type message, send voices and text -->
    <div class="fixed right-0 mr-0 md:mr-2 flex flex-row bottom-0 items-center rounded-xl" :class="{'w-full-md': storeSetting.showAside, 'w-full': !storeSetting.showAside}">
      <div class="w-full mr-8 p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row items-center mt-auto gap-3">
        
        <InputText v-model="txtMsg" placeholder="Escribir un mensaje!" class="w-full" />
        
        <div class="flex w-full sm:w-auto gap-3">
          
          <!-- Section buttons -->
          <Button @click="toggleAudio" severity="info" class="p-button-sm md:p-button-lg justify-center" aria-haspopup="true" aria-controls="overlay_panel">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </Button>
          <OverlayPanel ref="refOpAudio" class="rounded-xl border-gray-700">
            <Recorder @send-audio="callbackAudio"/>
          </OverlayPanel>

          <Button severity="info" class="w-full sm:w-auto">
            <span class="p-button-icon p-button-icon-right pi pi-send" data-pc-section="icon"></span>
            <span class="p-button-label" data-pc-section="label">Enviar</span>
          </Button>
          
        </div>
      </div>
    </div>

  </div>
</template>