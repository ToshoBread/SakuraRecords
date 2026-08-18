import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@fontsource-variable/plus-jakarta-sans'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
