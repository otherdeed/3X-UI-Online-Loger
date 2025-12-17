export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')
  if (!token.value && to.path !== '/auth') {
    return navigateTo('/auth')
  }
})
