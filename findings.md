# 发现与记录

## 项目结构
- monorepo 架构，使用 pnpm + Turbo 管理
- packages/web: Vue 3 + Vite + TypeScript 前端
- packages/server: Fastify + Prisma + SQLite 后端

## 技术栈
- **前端**: Vue 3 Composition API, Pinia, Vue Router, shadcn-vue, Tailwind CSS
- **后端**: Fastify, Prisma ORM, SQLite
- **API**: RESTful /api/notes（扩展支持搜索、筛选、关联）

## 部署
- GitHub Actions CI/CD
- 推送到 main 分支自动部署
- rsync 同步到远程服务器
- PM2 管理后端进程
- Nginx 反向代理配置

## 用户系统技术选型
- **认证方案**: JWT + HTTP-Only Cookie（安全，防 XSS）
- **密码哈希**: bcryptjs（纯 JS 实现，部署友好）
- **用户隔离**: 所有数据按用户ID过滤，确保数据安全
- **不选方案原因**: OAuth（复杂度高）、Session-Cookie（需Redis）、Magic Link（需邮件服务）

## 环境变量配置
```env
# 后端
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key-min-32-chars
PORT=3000

# 前端
VITE_API_BASE_URL=http://localhost:3000
```

## 核心功能技术决策

### 数据模型
- **User**: 用户认证信息
- **Note**: 笔记，支持标题、内容、标签、用户隔离
- **Idea**: 灵感，支持分类、优先级、完成状态
- **RecentActivity**: 最近访问记录，用户隔离
- **NoteVersion**: 笔记历史版本，支持版本控制

### 关键架构决策
1. **前后端分离**: Vue 3 前端 + Fastify 后端
2. **状态管理**: Pinia 集中状态，localStorage 持久化
3. **UI组件**: shadcn-vue 无头组件，确保一致性和可定制性
4. **数据库**: SQLite（开发）+ Prisma ORM（类型安全）
5. **认证**: JWT + HTTP-Only Cookie（兼顾安全和便利）

### 功能实现模式
- **CRUD操作**: 统一 RESTful API 设计
- **用户隔离**: 所有查询基于当前用户ID
- **实时反馈**: Toast 提示系统全局集成
- **数据同步**: 乐观更新，减少等待时间
- **错误处理**: 统一错误处理，用户友好提示

### 部署架构
- **前端**: Vite 构建，Nginx 静态文件服务
- **后端**: Fastify 服务，PM2 进程管理
- **数据库**: SQLite 文件，定期备份
- **监控**: 基础日志，可扩展监控

## 默认测试账户
```
用户名：admin
邮箱：admin@conan.local
密码：admin123
```

## 项目状态
✅ 14个核心功能全部完成，代码已推送到远程仓库，GitHub Actions自动部署。