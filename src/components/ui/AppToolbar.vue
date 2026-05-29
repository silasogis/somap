<template>
  <header class="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm transition-colors">
    <div class="flex items-center gap-4">
      <button @click="$emit('toggle-sidebar')" class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-400 flex items-center gap-2 tracking-tight">
        <div class="w-8 h-8 rounded-lg shadow-sm flex items-center justify-center overflow-hidden">
          <img src="/icons_somap/somap-mark.svg" class="w-full h-full object-cover" alt="SOMAP Icon" />
        </div>
        SOMAP - WebGIS
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button @click="toggleDark" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      </button>
      <div class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 pl-1 pr-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 hidden md:flex">
        <div class="w-6 h-6 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-300 text-xs font-bold">
          {{ auth.user?.name.charAt(0) || 'U' }}
        </div>
        <span>{{ auth.user?.name || 'Administrador' }}</span>
      </div>
      <button @click="handleLogout" class="text-sm px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded transition-colors font-semibold ml-1">Sair</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

defineEmits(['toggle-sidebar'])

const auth = useAuthStore()
const router = useRouter()

function toggleDark() {
  document.documentElement.classList.toggle('dark')
  document.body.classList.toggle('dark')
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
