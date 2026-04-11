import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../views/Landing.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 入口页
    {
      path: '/',
      name: 'landing',
      component: Landing,
    },
    // 认证页面（无需登录）
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    // 主应用（带侧边栏布局，需要登录）
    {
      path: '/app',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
        },
        {
          path: 'tools',
          name: 'tools',
          component: () => import('../views/Tools.vue'),
        },
        {
          path: 'notes',
          name: 'notes',
          component: () => import('../views/Notes.vue'),
        },
        {
          path: 'ideas',
          name: 'ideas',
          component: () => import('../views/Ideas.vue'),
        },
      ],
    },
    // 重定向：访问旧路径 /tools 等自动转到 /app/tools
    {
      path: '/:pathMatch(.*)*',
      redirect: (to) => `/app${to.path}`,
    },
  ],
});

// 导航守卫
router.beforeEach(async (to) => {
  // 白名单路由
  const publicRoutes = ['/', '/login', '/register'];
  if (publicRoutes.includes(to.path)) {
    return true;
  }

  // 检查登录状态
  const authStore = await import('@/stores/auth');
  const { useAuthStore } = authStore;
  const store = useAuthStore();

  // 总是尝试获取用户信息（即使 store.user 存在也要重新验证）
  try {
    await store.fetchUser();
  } catch (e) {
    // 未登录，重定向到登录页
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  // 用户已登录，继续访问
  return true;
});

export default router;
