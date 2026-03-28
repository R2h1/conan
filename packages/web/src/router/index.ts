import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../views/Landing.vue';
import DefaultLayout from '../layouts/DefaultLayout.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 入口页
    {
      path: '/',
      name: 'landing',
      component: Landing,
    },
    // 主应用（带侧边栏布局）
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

export default router;
