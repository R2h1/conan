# 任务计划：Conan 数字平台

## 任务 1：用户系统（已完成）

### 目标
为 Conan 平台添加完整的用户认证系统，实现多用户支持和数据隔离。

### 用户决策
| 问题 | 选择 |
|------|------|
| JWT 密钥管理 | 服务器环境变量注入 |
| 注册字段 | 用户名 + 邮箱 + 密码 |
| 现有笔记处理 | 迁移到默认用户 |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 后端依赖安装 | ✅ 完成 | bcryptjs, jsonwebtoken, @fastify/jwt, @fastify/cookie |
| 2. Prisma Schema 修改 | ✅ 完成 | 添加 User 模型，Note 添加 userId 字段 |
| 3. 密码哈希工具 | ✅ 完成 | src/lib/password.ts |
| 4. Auth 插件 | ✅ 完成 | src/plugins/auth.ts |
| 5. 认证中间件 | ✅ 完成 | src/plugins/auth-middleware.ts |
| 6. 认证路由 | ✅ 完成 | /api/auth/register, /api/auth/login, /api/auth/me |
| 7. Note API 改造 | ✅ 完成 | 添加用户过滤 |
| 8. 前端 Pinia 初始化 | ✅ 完成 | main.ts 添加 Pinia |
| 9. 前端 Auth Store | ✅ 完成 | src/stores/auth.ts |
| 10. 前端 Auth API | ✅ 完成 | src/api/auth.ts |
| 11. 登录/注册页面 | ✅ 完成 | Login.vue, Register.vue |
| 12. 路由守卫 | ✅ 完成 | 保护受认证路由 |
| 13. 布局更新 | ✅ 完成 | 用户信息 + 退出按钮 |
| 14. 数据迁移 | ✅ 完成 | 默认用户已创建 |
| 15. 后端测试 | ✅ 完成 | 后端运行在 http://localhost:3000 |
| 16. 前端测试 | ✅ 完成 | 前端运行在 http://localhost:5173 |
| 17. 功能验证 | ✅ 完成 | Chrome MCP 测试通过 |
| 18. 路由守卫修复 | ✅ 完成 | 修复未登录可访问 /app 的问题 |

### 默认账户

```
用户名：admin
邮箱：admin@conan.local
密码：admin123
```

---

## 任务 2：UI 重新设计（已完成）

### 目标
为 Conan 平台建立统一的视觉语言，完善 Dashboard 和 Ideas 页面功能，优化整体 UI 体验。

### 用户决策
| 问题 | 选择 |
|------|------|
| 设计优先级 | 整体风格统一 → 先确定设计语言，再逐个实现 |
| Ideas 功能 | 完整版本 → 分类、标签、完成状态、优先级排序 |
| Dashboard 内容 | 全部 → 统计概览 + 快捷入口 + 最近访问 |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 0. 设计语言定义 | ✅ 完成 | 增强 styles.css，统一视觉规范 |
| 1. Dashboard 页面 | ✅ 完成 | 统计卡片、快捷入口、最近访问、快速记录 |
| 2. Ideas 页面 | ✅ 完成 | 灵感卡片、分类标签、优先级、完成状态 |
| 3. Landing 页优化 | ✅ 完成 | 英雄区动画、功能卡片优化 |
| 4. 布局优化 | ✅ 完成 | 侧边栏动效、页面切换过渡 |
| 5. Tools 页面扩展 | ✅ 完成 | 新增时间戳转换、Base64 编解码等工具 |

### 关键文件路径

#### 需要修改的文件
- `packages/web/src/views/Dashboard.vue`
- `packages/web/src/views/Ideas.vue`
- `packages/web/src/views/Landing.vue`
- `packages/web/src/views/Tools.vue`
- `packages/web/src/layouts/DefaultLayout.vue`
- `packages/web/src/styles.css`

#### 需要创建的文件
- `packages/web/src/components/ideas/IdeaCard.vue`
- `packages/web/src/components/ideas/IdeaList.vue`
- `packages/web/src/components/ideas/IdeaEditor.vue`
- `packages/web/src/components/dashboard/StatCard.vue`
- `packages/web/src/components/dashboard/QuickActions.vue`
- `packages/web/src/components/dashboard/RecentActivity.vue`
- `packages/web/src/components/tools/TimestampConverter.vue`
- `packages/web/src/components/tools/Base64Converter.vue`

### 设计原则

1. **简洁优先**: 保持界面简洁，避免过度设计
2. **一致性**: 所有页面使用统一的设计语言
3. **渐进增强**: 在现有基础上逐步优化
4. **移动优先**: 确保移动端体验流畅
5. **性能友好**: 避免过多的动画和复杂计算

### 技术栈

- **框架**: Vue 3 + Vite + TypeScript
- **UI 库**: shadcn-vue (reka-ui 无头组件)
- **样式**: Tailwind CSS + CSS 变量主题系统
- **图标**: lucide-vue-next
- **状态管理**: Pinia

---

## 任务 3：Toast 提示系统（已完成）

### 目标
为 Conan 平台添加统一的 Toast 提示系统，提升用户体验。

### 需求
- 支持成功、错误、警告、信息四种类型
- 自动消失（可配置时间）
- 支持手动关闭
- 多个 Toast 堆叠显示
- 响应式支持（移动端适配）
- 与现有主题系统（明暗模式）集成

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 安装 shadcn-vue toast | ✅ 完成 | 使用 `npx shadcn-vue add toast` 安装 |
| 2. 添加 Toaster 到根组件 | ✅ 完成 | App.vue 添加 Toaster 组件 |
| 3. 集成到登录/注册页面 | ✅ 完成 | Login.vue、Register.vue 添加成功/失败提示 |
| 4. 集成到 Notes 页面 | ✅ 完成 | NoteEditor.vue 添加保存/删除提示 |
| 5. 集成到 Ideas 页面 | ✅ 完成 | Ideas.vue 添加创建/编辑/删除提示 |
| 6. 集成到 Dashboard 页面 | ✅ 完成 | Dashboard.vue 快速记录提示 |
| 7. 集成到 Tools 页面 | ✅ 完成 | Tools.vue JSON/Base64/时间戳操作提示 |

### 技术方案

采用 shadcn-vue 官方 Toast 组件，通过 CLI 安装：

```bash
npx shadcn-vue add toast
```

**已安装文件**:
```
packages/web/src/components/ui/toast/
  - Toast.vue
  - ToastAction.vue
  - ToastClose.vue
  - ToastDescription.vue
  - ToastProvider.vue
  - ToastTitle.vue
  - ToastViewport.vue
  - Toaster.vue
  - index.ts
  - use-toast.ts
```

### 用户决策
| 问题 | 选择 |
|------|------|
| Toast 实现方式 | shadcn-vue 官方组件（而非自研） |

### 完成总结

Toast 提示系统已全部集成完成，覆盖以下场景：
- ✅ 登录/注册成功/失败
- ✅ 笔记保存/删除
- ✅ 灵感创建/编辑/删除
- ✅ 快速记录
- ✅ JSON 格式化/压缩
- ✅ 时间戳转换
- ✅ Base64 编解码
- ✅ 复制输出
