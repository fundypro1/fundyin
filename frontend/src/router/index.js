// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authGuard, adminGuard, tokenRefreshGuard } from './guards'
import AuthService from '../services/auth';


// Import your components
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Deposit from '@/views/Deposit.vue'
import Withdraw from '@/views/Withdraw.vue'
import Investment from '@/views/Investment.vue'
import Referrals from '@/views/Referrals.vue'
import AdminRgister from '../views/AdminRgister.vue';
import Dashboard from '@/views/Dashboard.vue'
import Profile from '@/views/Profile.vue'
import AdminPanel from '@/views/AdminPanel.vue'
import AdminLogin from '@/views/AdminLogin.vue';

const routes = [
  {
    path: '/',
    redirect: '/deposit'
  },
  
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      requiresAuth: false,
      title: 'Sign In - Fundy'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      requiresAuth: false,
      title: 'Create Account - Fundy'
    }
  },
  {
    path: '/deposit',
    name: 'Deposit',
    component: Deposit,
    meta: { 
      requiresAuth: true,
      title: 'Deposit - Fundy'
    }
  },
  {
    path: '/withdraw',
    name: 'Withdraw',
    component: Withdraw,
    meta: { 
      requiresAuth: true,
      title: 'Withdraw - Fundy'
    }
  },
  {
    path: '/investments',
    name: 'Investment',
    component: Investment,
    meta: { 
      requiresAuth: true,
      title: 'Investment - Fundy'
    }
  },
  {
    path: '/referrals',
    name: 'Referrals',
   
    component: Referrals,
    icon: '👥',
    meta: { 
      requiresAuth: true,
      title: 'Investment - Fundy'
    }
  },
 
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      title: 'Dashboard - Fundy'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      requiresAuth: false,
      title: 'Profile - Fundy'
    }
  },
  {
    path: '/admin4321',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { 
      requiresAuth: false,
      requiresAdmin: false,  // login page never requires admin
      title: 'Admin Login - Fundy'
    }
  },
  {
    path: '/admin/register4321',
    name: 'AdminRegister',
    component: AdminRgister,
    meta: { 
      requiresAdmin: false,
      requiresAuth: false,
      title: 'Create Admin Account - Fundy'
    }
  },
  {
    path: '/panel4321',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { 
      requiresAdmin: true,   // 🚀 must require admin
      title: 'Admin Panel - Fundy'
    }
  }
,  
  // {
  //   path: '/forgot-password',
  //   name: 'ForgotPassword',
  //   component: ForgotPassword,
  //   meta: { 
  //     requiresAuth: false,
  //     title: 'Reset Password - Fundy'
  //   }
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { 
      title: 'Page Not Found - Fundy'
    }
  }
]

// const router = createRouter({
//   history: createWebHistory(process.env.BASE_URL),
//   routes,
//   scrollBehavior(to, from, savedPosition) {
//     if (savedPosition) {
//       return savedPosition
//     } else {
//       return { top: 0 }
//     }
//   }
// })

// Global navigation guards
// router.beforeEach(async (to, from, next) => {
//   // Set page title
//   if (to.meta.title) {
//     document.title = to.meta.title
//   }

//   // Check token validity and refresh if needed
//   await tokenRefreshGuard(to, from, () => {
//     // Check authentication requirements
//     if (to.meta.requiresAdmin) {
//       adminGuard(to, from, next)
//     } else {
//       authGuard(to, from, next)
//     }
//   })
// })

// Global after guards
// router.afterEach((to, from) => {
//   // You can add analytics tracking here
//   console.log(`Navigated from ${from.path} to ${to.path}`)
// })



const router = createRouter({
  history: createWebHistory(),
  routes,
})

// --- Single navigation guard ---
router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated()
  const isAdminAuthenticated = AuthService.isAdminAuthenticated()

  // ✅ Admin routes
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAdminAuthenticated) {
      return next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    }
    return next()
  }

  // ✅ User routes
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
    return next()
  }

  next()
})

export default router
