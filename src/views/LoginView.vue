<template>
  <div class="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors overflow-hidden">
    <!-- Imagem de Fundo com 50% de Opacidade -->
    <div class="absolute inset-0 z-0 pointer-events-none opacity-50 select-none">
      <img src="/pexels-slimmars-13-197677686-27062665.jpg" class="w-full h-full object-cover" alt="Fundo SOMAP" />
    </div>

    <!-- Card de Login com Efeito de Vidro (Glassmorphism) -->
    <div class="relative z-10 max-w-sm w-full space-y-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50">
      <div>
        <div class="mx-auto w-21 h-21 mb-6 flex items-center justify-center overflow-hidden rounded-2xl">
          <img src="/icons_somap/favicon-light.svg" class="w-full h-full object-cover" alt="SOMAP Icon" />
        </div>
        <h2 class="mt-2 text-center text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          SOMAP WebGIS
        </h2>
        <p class="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          Solução WebGIS completa para gestão e integração de dados territoriais.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
        <div class="space-y-4">
          <div>
            <label for="email-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required v-model="email"
                   class="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all sm:text-sm shadow-sm" placeholder="seu@email.com">
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required v-model="password"
                   class="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all sm:text-sm shadow-sm" placeholder="••••••••">
          </div>
        </div>

        <div v-if="error" class="text-sm text-red-600 dark:text-red-400 text-center font-medium bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">{{ error }}</div>

        <div>
          <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all shadow-md hover:shadow-lg">
            Entrar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')

const auth = useAuthStore()
const router = useRouter()

async function onSubmit() {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/map')
  } catch {
    error.value = 'Falha no login. Verifique o servidor.'
  }
}
</script>
