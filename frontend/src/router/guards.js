// router/guards.js
import AuthService from '@/services/auth'

export const authGuard = (to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated()
  
  // Routes that require authentication
  const protectedRoutes = ['/deposit', '/deposits', '/profile', '/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
  
  if (isProtectedRoute && !isAuthenticated) {
    // Store the intended destination
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to deposit page if already logged in and trying to access login
    next('/deposit')
  } else {
    next()
  }
}

export const adminGuard = (to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated()
  const isAdmin = AuthService.isAdmin()
  
  if (!isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (!isAdmin) {
    // Not an admin, redirect to deposit page
    next('/deposit')
  } else {
    next()
  }
}

// Token refresh guard - checks token validity before route changes
export const tokenRefreshGuard = async (to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated()
  
  if (isAuthenticated && AuthService.isTokenExpired()) {
    try {
      await AuthService.refreshToken()
      next()
    } catch (error) {
      console.error('Token refresh failed:', error)
      AuthService.logout()
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
}