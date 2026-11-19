import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCKS === 'false' || process.env.NODE_ENV === 'production') {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
    }
    return
  }

  const { worker } = await import('./mocks/browser')
  // Remove old service workers safely, which might be conflicting due to base path change
  const registrations = await navigator.serviceWorker.getRegistrations()
  for (const registration of registrations) {
    await registration.unregister()
  }
  
  return worker.start({ 
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`
    },
    onUnhandledRequest: 'bypass' 
  })
}

enableMocking().then(() => {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
})
