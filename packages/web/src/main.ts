import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router);

// 初始化主题
import { useThemeStore } from './stores/theme';
app.mount('#app');

// 在应用挂载后初始化主题
const themeStore = useThemeStore();
themeStore.initializeTheme();
