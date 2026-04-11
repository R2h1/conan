# 任务计划：用户系统

## 目标
为 Conan 平台添加完整的用户认证系统，实现多用户支持和数据隔离。

## 用户决策
| 问题 | 选择 |
|------|------|
| JWT 密钥管理 | 服务器环境变量注入 |
| 注册字段 | 用户名 + 邮箱 + 密码 |
| 现有笔记处理 | 迁移到默认用户 |

## 阶段

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

## 关键文件路径

### 后端
- `packages/server/prisma/schema.prisma`
- `packages/server/src/index.ts`
- `packages/server/src/plugins/auth.ts`
- `packages/server/src/plugins/auth-middleware.ts`
- `packages/server/src/routes/auth.ts`
- `packages/server/src/lib/password.ts`

### 前端
- `packages/web/src/main.ts`
- `packages/web/src/router/index.ts`
- `packages/web/src/stores/auth.ts`
- `packages/web/src/api/auth.ts`
- `packages/web/src/layouts/DefaultLayout.vue`
- `packages/web/src/views/Login.vue`
- `packages/web/src/views/Register.vue`

## 后端完成情况

### 已创建文件
- ✅ `src/lib/password.ts` - 密码哈希工具
- ✅ `src/plugins/auth.ts` - JWT 插件配置
- ✅ `src/plugins/auth-middleware.ts` - 认证中间件
- ✅ `src/routes/auth.ts` - 认证路由
- ✅ `scripts/migrate-data.ts` - 数据迁移脚本

### 已修改文件
- ✅ `prisma/schema.prisma` - 添加 User 模型
- ✅ `src/index.ts` - 注册插件和路由，改造 Note API

### API 端点
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户
- `POST /api/auth/logout` - 登出
- `GET /api/notes` - 获取笔记列表（需认证）
- `POST /api/notes` - 创建笔记（需认证）
- `PUT /api/notes/:id` - 更新笔记（需认证）
- `DELETE /api/notes/:id` - 删除笔记（需认证）
- `GET /api/notes/:id` - 获取单个笔记（需认证）

## 前端完成情况

### 已创建文件
- ✅ `src/stores/auth.ts` - Auth Store
- ✅ `src/api/auth.ts` - Auth API 客户端
- ✅ `src/views/Login.vue` - 登录页面
- ✅ `src/views/Register.vue` - 注册页面
- ✅ `src/components/ui/label/` - Label 组件

### 已修改文件
- ✅ `src/main.ts` - 初始化 Pinia
- ✅ `src/api/notes.ts` - 添加 withCredentials
- ✅ `src/router/index.ts` - 添加路由和导航守卫
- ✅ `src/layouts/DefaultLayout.vue` - 用户信息和退出按钮
- ✅ `src/components/notes/NoteEditor.vue` - 修复 TypeScript 错误
- ✅ `src/components/notes/NoteList.vue` - 修复 TypeScript 错误

## 默认账户

```
用户名：admin
邮箱：admin@conan.local
密码：admin123
```

## 测试步骤

1. 启动后端：`cd packages/server && pnpm dev`
2. 启动前端：`cd packages/web && pnpm dev`
3. 访问 `http://localhost:5173`
4. 使用默认账户登录
5. 测试笔记 CRUD 功能