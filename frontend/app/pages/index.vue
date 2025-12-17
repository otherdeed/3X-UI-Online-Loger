<template>
  <div class="h-screen flex flex-col bg-gray-950 text-gray-200 font-mono overflow-hidden">
    <header class="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900 shadow-xl shrink-0">
      <div class="flex items-center gap-2 sm:gap-3">
        <div
          :class="isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'"
          class="w-2 h-2 rounded-full"
        />
        <h1 class="text-[10px] sm:text-xs font-bold tracking-widest text-gray-400 uppercase truncate">
          Xray Monitor
        </h1>
        <div
          v-if="clientCount > 0"
          class="flex items-center gap-1 text-[10px] text-gray-500"
          title="Активных подключений"
        >
          <svg
            class="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ clientCount }}</span>
        </div>
      </div>

      <div class="flex gap-3 sm:gap-4">
        <button
          class="text-[10px] text-gray-500 hover:text-white transition uppercase cursor-pointer"
          @click="clearLogs"
        >
          Clean
        </button>
        <button
          :class="autoScroll ? 'text-blue-400' : 'text-gray-500'"
          class="text-[10px] transition uppercase font-bold cursor-pointer"
          @click="autoScroll = !autoScroll"
        >
          <span class="hidden sm:inline">Scroll:</span> {{ autoScroll ? 'ON' : 'OFF' }}
        </button>
      </div>
    </header>

    <main
      ref="scrollContainer"
      class="flex-1 overflow-y-auto p-2 sm:p-4 space-y-0.5 scroll-smooth custom-scroll"
    >
      <div
        v-if="logs.length === 0"
        class="text-gray-700 text-xs italic mt-4 px-2"
      >
        Ожидание записи в access.log...
      </div>

      <div
        v-for="(log, index) in logs"
        :key="index"
        class="text-[10px] sm:text-xs py-1 border-l border-gray-800 pl-2 sm:pl-3 flex items-start sm:items-center gap-2 sm:gap-4 hover:bg-white/5 transition-colors group"
      >
        <span class="hidden sm:block text-gray-700 w-8 shrink-0 text-right select-none group-hover:text-gray-500">
          {{ index + 1 }}
        </span>

        <span class="text-gray-500 shrink-0 tabular-nums">
          {{ log.timestamp.split(' ')[1] || log.timestamp }}
        </span>

        <span
          class="w-7 sm:w-10 shrink-0 font-bold uppercase text-center sm:text-left"
          :class="log.protocol === 'udp' ? 'text-orange-500' : 'text-blue-500'"
        >
          {{ log.protocol }}
        </span>

        <div class="flex flex-col sm:flex-row flex-1 min-w-0 sm:gap-4">
          <span class="text-yellow-500 font-semibold truncate sm:w-24 shrink-0">
            {{ log.email || 'system' }}
          </span>

          <span class="text-gray-100 break-all truncate sm:whitespace-normal tracking-tight">
            {{ log.destination }}
          </span>
        </div>

        <span class="hidden md:block text-gray-600 text-[10px] shrink-0 italic">
          {{ log.metadata }}
        </span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { LogEntry } from '~/types'

const clientCount = ref(0)

const logs = ref<LogEntry[]>([])
const isConnected = ref(false)
const autoScroll = ref(true)
const scrollContainer = ref<HTMLElement | null>(null)
let socket: WebSocket | null = null
const config = useRuntimeConfig()
const token = useCookie('auth_token')
const url = config.public.wsUrl + '?token=' + token.value

const connect = () => {
  if (import.meta.server) return
  socket = new WebSocket(url)

  socket.onopen = () => {
    isConnected.value = true
    console.log('Подключено к WebSocket')
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'stats') {
        clientCount.value = data.clientCount
        return
      }
      if (data.raw && typeof data.raw === 'string') {
        const logEntry = parseLogLine(data.raw)
        if (logEntry) {
          logs.value.push(logEntry)
          if (logs.value.length > 5000) logs.value.shift()
          if (autoScroll.value) scrollToBottom()
        }
      }
    } catch {
      const logEntry = parseLogLine(event.data)
      if (logEntry) {
        logs.value.push(logEntry)
        if (logs.value.length > 5000) logs.value.shift()
        if (autoScroll.value) scrollToBottom()
      }
    }
  }

  socket.onclose = () => {
    isConnected.value = false
    setTimeout(() => {
      if (!isConnected.value) connect()
    }, 3000)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

const clearLogs = () => {
  logs.value = []
}

onMounted(() => connect())
onUnmounted(() => {
  socket?.close()
  socket = null
})
definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 3px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}

:global(body) {
  margin: 0;
  background-color: #030712;
  touch-action: manipulation;
}
</style>
