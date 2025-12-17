export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')
  console.log('aaa')
  if (!token.value && to.path !== '/auth') {
    return navigateTo('/auth')
  }
})
