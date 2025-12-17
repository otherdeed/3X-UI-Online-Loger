<template>
  <div class="flex h-screen items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h3 class="text-xl font-bold">
          Доступ к логам
        </h3>
      </template>
      <form
        class="space-y-4 flex flex-col gap-1"
        @submit.prevent="handleLogin"
      >
        <UFormField label="Введите пароль администратора">
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            class="w-full"
          />
        </UFormField>
        <UButton
          type="submit"
          block
          :disabled="password.length === 0"
          :loading="loading"
          color="primary"
        >
          Войти
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const password = ref('')
const loading = ref(false)
const toast = useToast()
const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 })
const config = useRuntimeConfig()
async function handleLogin() {
  loading.value = true
  try {
    const data = await $fetch<{ success: boolean, token: string }>(`${config.public.apiUrl}/login`, {
      method: 'POST',
      body: { password: password.value }
    })

    if (data.success) {
      token.value = data.token
      await navigateTo('/')
    }
  } catch (err) {
    toast.add({
      title: 'Ошибка',
      description: err.data?.message || 'Неверный пароль',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
