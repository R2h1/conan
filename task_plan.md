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

---

## 任务 3：Toast 提示系统（已完成）

### 目标
为 Conan 平台添加统一的 Toast 提示系统，提升用户体验。

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

### MCP 测试结果
| 测试项 | 结果 |
|--------|------|
| 登录失败 Toast | ✅ 通过 |
| 登录成功 Toast | ✅ 通过 |
| 笔记创建 Toast | ✅ 通过 |
| JSON 格式化错误 Toast | ✅ 通过 |
| JSON 格式化成功 Toast | ✅ 通过 |

---

## 任务 4：灵感箱 (Ideas) 后端 API 实现（进行中）

### 目标
为灵感箱功能添加完整的后端 API 支持，实现数据的持久化存储。

### 现状分析
- **前端**：Ideas.vue 已完整实现，使用模拟数据
- **后端**：缺少 Idea 数据模型和 API 路由
- **数据**：刷新页面后数据丢失

### 需求
- 支持灵感的增删改查
- 支持分类、标签、优先级、完成状态
- 按用户隔离数据
- 支持筛选和排序

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. Prisma Schema 扩展 | ✅ 完成 | 添加 Idea 模型 |
| 2. 后端 API 路由 | ✅ 完成 | 创建 /api/ideas 路由 |
| 3. 前端 API 客户端 | ✅ 完成 | 创建 src/api/ideas.ts |
| 4. Ideas 页面集成 | ✅ 完成 | 替换模拟数据为真实 API |
| 5. 数据迁移 | ✅ 完成 | 运行 prisma db push |
| 6. 测试验证 | ✅ 完成 | MCP 测试灵感功能 |

### 完成总结

灵感箱后端 API 已全部完成，功能包括：
- ✅ 获取灵感列表（支持分类/优先级/完成状态/标签筛选）
- ✅ 获取单个灵感
- ✅ 创建灵感
- ✅ 更新灵感
- ✅ 删除灵感
- ✅ 切换完成状态

### MCP 测试结果
| 测试项 | 结果 |
|--------|------|
| 创建灵感 | ✅ 通过 |
| 编辑灵感 | ✅ 通过 |
| 删除灵感 | ✅ 通过 |
| Toast 提示 | ✅ 通过 |

### 关键文件路径

**需要创建的文件**:
- `packages/server/src/routes/ideas.ts`
- `packages/web/src/api/ideas.ts`

**需要修改的文件**:
- `packages/server/prisma/schema.prisma`
- `packages/server/src/index.ts`
- `packages/web/src/views/Ideas.vue`

---

## 任务 5：Dashboard 真实数据集成（已完成）

### 目标
将 Dashboard 的统计数据和最近访问列表连接到真实 API。

### 现状
- 统计数据是硬编码的模拟值
- 最近访问列表是静态数据
- 快速记录功能未实现实际保存

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 统计 API | ✅ 完成 | 创建 /api/stats 端点 |
| 2. 前端集成 | ✅ 完成 | Dashboard.vue 调用 API |
| 3. 快速记录实现 | ✅ 完成 | 保存到笔记 API |

### 完成总结

Dashboard 真实数据集成已完成，功能包括：
- ✅ 统计数据 API（笔记总数、灵感数、本周笔记数）
- ✅ 前端自动加载统计数据
- ✅ 快速记录功能（保存到笔记 API）
- ✅ 保存后自动更新统计

### 关键文件路径

**创建的文件**:
- `packages/web/src/api/stats.ts`

**修改的文件**:
- `packages/server/src/index.ts` - 添加 /api/stats 端点
- `packages/web/src/views/Dashboard.vue` - 集成真实 API

---

## 任务 6：部署配置（已完成）

### 目标
完善 Conan 平台的部署配置和文档。

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 检查现有部署配置 | ✅ 完成 | GitHub Actions workflow 已存在 |
| 2. 更新部署配置 | ✅ 完成 | 添加 .env.example 模板生成 |
| 3. 创建 .env 示例文件 | ✅ 完成 | server 和 web 包的 .env.example |
| 4. 添加部署文档 | ✅ 完成 | DEPLOY.md 详细部署指南 |

### 完成总结

部署配置已完成，包括：
- ✅ GitHub Actions 自动部署工作流
- ✅ 后端 .env.example（JWT_SECRET, DATABASE_URL, PORT）
- ✅ 前端 .env.example（VITE_API_BASE_URL）
- ✅ 详细部署文档 DEPLOY.md

### 关键文件路径

**创建的文件**:
- `packages/server/.env.example`
- `packages/web/.env.example`
- `DEPLOY.md`

**修改的文件**:
- `.github/workflows/deploy.yml` - 添加 .env.example 生成步骤

### GitHub Secrets 配置

| Secret | 说明 |
|--------|------|
| `DEPLOY_HOST` | 远程服务器 IP 或域名 |
| `DEPLOY_USER` | SSH 用户名 |
| `DEPLOY_KEY` | SSH 私钥 |
| `DEPLOY_PATH_FRONTEND` | 前端部署路径 |
| `DEPLOY_PATH_BACKEND` | 后端部署路径 |

---

## 设计原则

1. **简洁优先**: 保持界面简洁，避免过度设计
2. **一致性**: 所有页面使用统一的设计语言
3. **渐进增强**: 在现有基础上逐步优化
4. **移动优先**: 确保移动端体验流畅
5. **性能友好**: 避免过多的动画和复杂计算

## 技术栈

- **框架**: Vue 3 + Vite + TypeScript
- **UI 库**: shadcn-vue (reka-ui 无头组件)
- **样式**: Tailwind CSS + CSS 变量主题系统
- **图标**: lucide-vue-next
- **状态管理**: Pinia
- **后端**: Fastify + Prisma + SQLite
