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
      meta: { title: '首页' },
    },
    // 认证页面（无需登录）
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: '登录' },
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { title: '注册' },
    },
    // 主应用（带侧边栏布局，需要登录）
    {
      path: '/app',
      component: DefaultLayout,
      redirect: '/app/tools',
      meta: { title: '工具集' },
      children: [
        {
          path: 'tools',
          name: 'tools',
          component: () => import('../views/Tools.vue'),
          meta: { title: '工具集' },
        },
      ],
    },
    // 重定向：访问旧路径自动转到 /app
    {
      path: '/:pathMatch(.*)*',
      redirect: '/app',
    },
  ],
});

// 导航守卫
router.beforeEach(async (to) => {
  // 更新页面标题
  const pageTitle = to.meta?.title || 'Conan数字平台';
  document.title =
    pageTitle === 'Conan数字平台' ? pageTitle : `${pageTitle} - Conan数字平台`;

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

  // 用户已登录，记录页面访问（异步，不阻塞导航）
  try {
    // 动态导入活动记录API
    const activitiesModule = await import('@/api/activities');
    const { recordPageVisit } = activitiesModule;

    // 只记录主要页面访问
    const pagePaths = [
      '/app/tools',
    ];
    if (pagePaths.includes(to.path)) {
      recordPageVisit(to.path);
    }
  } catch (error) {
    console.warn('记录页面访问失败:', error);
    // 不影响导航
  }

  // 用户已登录，继续访问
  return true;
});

export default router;
