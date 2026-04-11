# 发现与记录

## 项目结构
- monorepo 架构，使用 pnpm + Turbo 管理
- packages/web: Vue 3 + Vite + TypeScript 前端
- packages/server: Fastify + Prisma + SQLite 后端

## 技术栈
- 前端：Vue 3 Composition API, Pinia, Vue Router, shadcn-vue, Tailwind CSS
- 后端：Fastify, Prisma ORM, SQLite
- API: RESTful /api/notes

## 部署
- GitHub Actions CI/CD
- 推送到 main 分支自动部署
- rsync 同步到远程服务器
- PM2 管理后端进程

## 用户系统技术选型

### 认证方案
- **JWT + HTTP-Only Cookie**: 比 localStorage 更安全，防 XSS
- **bcryptjs**: 纯 JS 实现，无需原生模块，部署友好
- **@fastify/jwt**: Fastify 官方 JWT 插件

### 为什么不选其他方案
- OAuth/第三方登录：首批用户少，增加复杂度，可后续扩展
- Session-Cookie：需要 Redis 等外部存储，对 SQLite 架构不经济
- Magic Link：需要邮件服务，增加运维成本

### Prisma Schema 设计
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String   @unique      // 用户名
  email     String   @unique      // 邮箱
  password  String                // bcrypt 哈希
  notes     Note[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Note {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  tags      String
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 环境变量配置
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key-min-32-chars  # 从服务器环境变量注入
```
