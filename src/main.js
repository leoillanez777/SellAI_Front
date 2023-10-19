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
import FocusTrap from 'primevue/focustrap'
import './assets/primevue' // get css of primevue
// get svg Icons
import { VueSvgIconPlugin } from '@yzfe/vue3-svgicon'
import '@yzfe/svgicon/lib/svgicon.css'

// config axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/'

// create vue app
const app = createApp(App)

app.use(createPinia())

// apply svgIcon
app.use(VueSvgIconPlugin, { tagName: 'icon' })

// apply routers
app.use(routers)

// apply primevue
app.use(PrimeVue)
app.use(ToastService)
app.use(ConfirmationService)
app.directive('tooltip', Tooltip)
app.directive('focustrap', FocusTrap)

app.mount('#app')
