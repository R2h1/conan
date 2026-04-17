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
      meta: { title: '仪表盘' },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: { title: '仪表盘' },
        },
        {
          path: 'tools',
          name: 'tools',
          component: () => import('../views/Tools.vue'),
          meta: { title: '工具集' },
        },
        {
          path: 'notes',
          name: 'notes',
          component: () => import('../views/Notes.vue'),
          meta: { title: '知识库' },
        },
        {
          path: 'ideas',
          name: 'ideas',
          component: () => import('../views/Ideas.vue'),
          meta: { title: '灵感箱' },
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
  // 更新页面标题
  const pageTitle = to.meta?.title || 'Conan数字平台';
  document.title = pageTitle === 'Conan数字平台' ? pageTitle : `${pageTitle} - Conan数字平台`;

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
    const pagePaths = ['/app', '/app/notes', '/app/ideas', '/app/tools'];
    if (pagePaths.includes(to.path)) {
      recordPageVisit(to.path, String(pageTitle));
    }
  } catch (error) {
    console.warn('记录页面访问失败:', error);
    // 不影响导航
  }

  // 用户已登录，继续访问
  return true;
});

export default router;
