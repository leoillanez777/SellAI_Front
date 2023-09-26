<template>
  <div class="flex justify-center items-center space-x-4 py-4 px-6 rounded-xl">
    <!-- BUTTON RECORD / PAUSE -->
    <button type="button" @click.native="toggleRecording" :class="classIsRecording"
      class="rounded-full cursor-pointer border px-6 py-6 p-2.5 font-medium text-sm text-center inline-flex items-center
        focus:ring-4 focus:outline-none focus:ring-blue-300">
      <i :class="state.iconRecord" style="font-size: 2rem"></i>
    </button>
    <!-- BUTTON STOP -->
    <button type="button" @click.native="stopRecording"
      class="text-neutral-500 border px-4 py-4 border-neutral-500 hover:bg-cyan-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
  <div class="flex justify-center">
    <canvas class="h-8 w-full" ref="canvas">
    </canvas>
  </div>
  <div class="flex justify-center">
    <div class="text-5xl font-extralight tracking-wide text-neutral-500">
      {{ computedDuration }}
    </div>
    <div class="text-base self-end text-neutral-500">s</div>
  </div>
  <div class="block mt-4">
    <p class="text-xs text-center text-slate-300 hover:text-slate-900">
      Tiempo limite de 20 segundos.
    </p>
    
    <div class="flex place-content-center items-center justify-center text-center bg-blue-100 rounded-3xl shadow-lg shadow-blue-500/5">
      <div class="flex-none w-14 self-center">
        <Button :icon="state.iconPlayback" aria-label="playback" @click="togglePlayback" severity="secondary" text rounded></Button>
      </div>
      <div class="flex-1 w-full h-full">
        <div class="bg-blue-100 shadow-lg shadow-sky-100/80 wave-mine" ref="waveform"></div>    
      </div>
      <div class="flex-1 w-14 self-center text-xs">
        {{ computedDurationPlayBack }}
      </div>
    </div>

    <div class="text-center mt-4">
      <Button @click="sendToServer" type="button" icon="pi pi-send" label="Enviar Audio" rounded outlined :loading="state.loading" :disabled="isEnabled"></Button>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from "vue"
  import { RecordRTCPromisesHandler } from 'recordrtc'
  //import WService from '@/plugins/ws'
  //import { useAlertStore } from '@/data'
  import Mp3Encoder from './lib/mp3-mpeg'
  import WaveSurfer from 'wavesurfer.js'
  import Button from 'primevue/button'

  const emit = defineEmits(['send-audio'])
  //const storeAlert = useAlertStore()

  // Create a new AudioContext or webkitAudioContext object
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  // Create a new AnalyserNode object
  const analyser = audioContext.createAnalyser()
  // Set the size of the Fast Fourier Transform (FFT) to 2048, which determines the number of frequency bins used for audio analysis
  analyser.fftSize = 2048
  // Declare a variable to hold the audio stream from the user's microphone
  let stream, bufferLength, dataArray, animationId

  // Define variables and functions as reactive references
  const audioTime = ref('00:00')
  const audioDuration = ref('00:00')
  const canvas = ref(null)    // reference to record graphics
  const waveform = ref(null)  // reference to Play graphics
  const wavesurfer = ref(null)
  //const wService = ref(new WService())
  const blobFile = ref(null)
  const state = reactive({
    loading: false,                   // Indicates that process is working.
    recorder: null,                   // Object to record audio
    audio: null,                      // MediaStreamSource object
    isRecording: false,               // Flag for recording status
    isPaused: false,                  // Flag for pause status
    duration: 0,                      // Total recording duration
    durationPlayback: 0,              // Playback duration (from WaveSurfer)
    iconRecord: 'pi pi-microphone',   // Icon for recording button
    iconPlayback: 'pi pi-play',       // Icon for playback button
    chunks: [],                       // Audio chunks (from RecordRTC)
    startTime: null,                  // Start time of the recording
    pauseTimes: []                    // Array to store pause times
  })
  
  // Function to get the user media (microphone)
  const getUserMedia = async () => {
    try {
       // Get the audio stream from the user's microphone
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Create a MediaStreamSource object with the audio stream
      state.audio = audioContext.createMediaStreamSource(stream)
      // Create a RecordRTC object to handle the audio recording
      state.recorder = new RecordRTCPromisesHandler(stream, {type: 'audio'})
      
      state.isRecording = true
      state.isPaused = false
      state.iconRecord = "pi pi-pause"
      state.startTime = new Date().getTime()

      loopDuration()

      // Connect the MediaStreamSource to the AnalyserNode
      bufferLength = analyser.frequencyBinCount
      dataArray = new Uint8Array(bufferLength)
      state.audio.connect(analyser)
    }
    catch (error) {
      console.log("Error en getUserMedia: ", error)
    }
  }
  
  // Function to toggle the recording status (start/pause)
  const toggleRecording = () =>{
    if (!state.isRecording) {
      startRecording()
    }
    else {
      togglePause()
    }
  }

  // Function to start recording
  const startRecording = async () => {
    await getUserMedia()
    await state.recorder.startRecording()
    draw()
  }

  // Function to toggle the pause status
  const togglePause = () => {
    if (!state.isPaused) {
      pauseRecording()
    }
    else {
      resumeRecording()
    }
  }

  // Function to pause the recording
  const pauseRecording = () => {
    state.recorder.pauseRecording()
    state.pauseTimes.push(new Date().getTime())
    state.iconRecord = "pi pi-microphone"
    state.isPaused = true
    cancelAnimationFrame(animationId)
  }

  // Resume recording function
  const resumeRecording = () => {
    // Destructure the pauseTimes array from the state object
    const { pauseTimes } = state
    // Check if there are any pause times recorded
    if (pauseTimes.length !== 0) {
      const lastPauseTime = pauseTimes.pop() // Get the last pause time from the array
      const pauseDuration = new Date().getTime() - lastPauseTime // Calculate the duration of the last pause
      pauseTimes.push(pauseDuration) // Add the duration of the last pause to the pauseTimes array
    }
    
    state.recorder.resumeRecording()
    state.iconRecord = "pi pi-pause"
    state.isPaused = false
    loopDuration()
    draw()
  }

  // Function to stop the recording
  const stopRecording = async () => {
    // Destructure the recorder object from the state
    const { recorder } = state

    // Stop the recorder and get the recorded audio as a blob
    const getState = await recorder.getState()
    if (getState === 'stopped') {
      return
    }
    await recorder.stopRecording()
    const blob = await recorder.getBlob()
    blobFile.value = blob

    // Create a new Audio object and load the recorded audio into it
    const audio = new Audio()
    audio.src = URL.createObjectURL(blob)
    
    const options = {
      container: waveform.value,  // HTML element to render the waveform
      height: 30,
      waveColor: '#428bca',       // Color of the waveform
      progressColor: '#31708f',   // Color of the progress bar
      cursorColor: 'navy',        // Color of the cursor
      url: audio.src
    }
    wavesurfer.value = null
    wavesurfer.value = WaveSurfer.create(options)
    // Add a finish event listener to the WaveSurfer instance
    wavesurfer.value.on('finish', () => { state.iconPlayback = 'pi pi-replay' })
    wavesurfer.value.on('decode', (duration) => (audioDuration.value = calculateTimeDuration(duration)))
    wavesurfer.value.on('timeupdate', (currentTime) => (audioTime.value = calculateTimeDuration(currentTime)))

    // Stop the recording stream, if it exists
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    // Reset the state properties related to recording
    getDuration()
    state.isRecording = false
    state.isPaused = false
    state.startTime = null
    state.duration = 0
    state.iconRecord = "pi pi-microphone"
    state.chunks = state.pauseTimes = []
    cancelAnimationFrame(animationId)
  }

  // Loop function to update the recording duration
  const loopDuration = () => {
    // If recording is not in progress or is paused, return
    if (!state.recorder || !state.isRecording || state.isPaused) {
      return
    }

    // Get and update the duration
    getDuration()
    // Wait for 1 second before updating the duration again
    setTimeout(loopDuration, 1000)
  }

  // Function to calculate the recording duration
  const getDuration = () => {
    // Calculate the total duration by subtracting pause time from the total time
    const subTotalDuration = new Date().getTime() - state.startTime
    let totalPauseTime = 0
    for (let i = 0; i < state.pauseTimes.length; i++) {
      totalPauseTime += state.pauseTimes[i] / 1000
    }

    const totalDuration = subTotalDuration / 1000 - totalPauseTime
    // Update the state with the total duration
    state.duration = totalDuration
  }

  // This function toggles playback of the recorded audio using the wavesurfer library
  const togglePlayback = () => {
    if (!wavesurfer.value || !wavesurfer.value.media.src === ''){
      return
    }

    wavesurfer.value.playPause()
    // Update the state object with the current playback icon
    state.iconPlayback = state.iconPlayback === 'pi pi-play' ? 'pi pi-pause': 'pi pi-play'
  }

  const sendToServer = () => {
    // recupero del audio el buffer.
    const audioBuffer = wavesurfer.value.backend.buffer
    if (audioBuffer === null) {
      return
    }

    state.loading = true

    // reviso cuantos canales tiene el audio (stereo, mono, etc).
    const numChannels = audioBuffer.numberOfChannels
    let leftChannel, rightChannel, resultMp3
    switch (numChannels) {
      case 1: // Mono
        leftChannel = audioBuffer.getChannelData(0)
        rightChannel = null
        break
      case 2:// Stereo
        leftChannel = audioBuffer.getChannelData(0)
        rightChannel =audioBuffer.getChannelData(1)
        console.error('Unsupported number of channels: ', numChannels)
        return
      default:
        console.error('Unsupported number of channels: ', numChannels)
        return
    }

    const encoderOptions = { channel: numChannels, bitRate : 128, sampleRate : 44100 }
    const mp3File = new Mp3Encoder(encoderOptions) // Inicializo constructor.
    // Convierto el audio en mp3
    if (numChannels === 1) {
      mp3File.encode(leftChannel)
      resultMp3 = mp3File.finish()
    }
    if (resultMp3.id) {
      // o lo envio como mensaje desde el chat.
      // wService.value.postData('interpreter/audio', resultMp3.blob).then(res => {
      //   // Enviar respuesta y archivo de audio.
      //   // Emit to Chat...
      //   emit('send-audio', res, resultMp3)
      // }).catch((error) => {
      //   storeAlert.clear()
      //   storeAlert.exception(error)
      // }).finally(() => {
      //   state.loading = false
      // })
    }
  }

  const calculateTimeDuration = (secs) => {
    let hr = Math.floor(secs / 3600)
    let min = Math.floor((secs - (hr * 3600)) / 60)
    let sec = Math.floor(secs - (hr * 3600) - (min * 60))

    if (min < 10) {
        min = "0" + min
    }

    if (sec < 10) {
        sec = "0" + sec
    }

    if(hr <= 0) {
        return min + ':' + sec
    }

    return hr + ':' + min + ':' + sec
  }

  const draw = () => {
    animationId = requestAnimationFrame(draw)
    const context = canvas.value.getContext('2d')
    if (analyser && context) {
      analyser.getByteTimeDomainData(dataArray)
      context.fillStyle = 'rgb(255, 255, 255)'
      context.fillRect(0, 0, canvas.value.width, canvas.value.height)
      context.lineWidth = 2
      context.strokeStyle = 'rgb(66, 139, 202)'
      context.beginPath()
      const sliceWidth = canvas.value.width * 1.0 / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = v * canvas.value.height / 2
        if (i === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
        x += sliceWidth
      }
      context.lineTo(canvas.value.width, canvas.value.height / 2)
      context.stroke()
    }
  }
  
  // Computed
  const isEnabled = computed(() => {
    if (!wavesurfer.value) {
      return true
    }
    return wavesurfer.value.media.src === '';
  })

  const classIsRecording = computed(() => ({
    'animate-pulse'         : state.isRecording,
    'text-neutral-200'      : state.isRecording,
    'text-neutral-500'      : !state.isRecording,
    'border-rose-600'       : state.isRecording, 
    'border-neutral-500'    : !state.isRecording,
    'bg-rose-600'           : state.isRecording, 
    'bg-transparent'        : !state.isRecording, 
    'shadow-lg'             : state.isRecording, 
    'shadow-rose-600/50'    : state.isRecording,
    'hover:bg-red-300'      : state.isRecording,
    'hover:bg-cyan-500'     : !state.isRecording,
    'hover:text-neutral-200': state.isRecording,
    'hover:text-white'      : !state.isRecording
  }))

  const computedDuration = computed(() => {
    const secs = state.duration
    return calculateTimeDuration(secs)
  })

  const computedDurationPlayBack = computed(() => {
    return audioTime.value + '/' + audioDuration.value
  })
  
</script>
<style scoped>
  #waveform ::part(cursor) {
    height: 30px;
    top: 28px;
    border-radius: 4px;
    border: 1px solid #fff;
  }
</style>