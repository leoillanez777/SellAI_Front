import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css' // get default css
import App from './App.vue'

// get css of tailwind
import './assets/tailwind.css'

// get middlewares
import axios from 'axios'
import routers from './routers'

// get config of primevue
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

import './assets/primevue' // get css of primevue

// config axios
axios.defaults.baseURL = 'https://localhost:7070/api/'

// create vue app
const app = createApp(App)

app.use(createPinia())

// apply routers
app.use(routers)

// apply primevue
app.use(PrimeVue)
app.use(ToastService)
app.use(ConfirmationService)
app.directive('tooltip', Tooltip);

app.mount('#app')
