# CLAUDE.md

本文件为在此仓库中工作的 Claude Code (claude.ai/code) 提供指导。

## 项目概述

Conan 是一个个人数字平台，集成工具、知识库和灵感收集。这是一个使用 pnpm 和 Turbo 管理的 monorepo。

## 架构

```
conan/
├── packages/
│   ├── web/          # Vue 3 + Vite 前端 + TypeScript
│   │   ├── src/
│   │   │   ├── api/      # API 客户端 (axios)
│   │   │   ├── components/
│   │   │   │   ├── notes/     # 笔记编辑/列表组件
│   │   │   │   ├── tools/     # 工具组件 (JsonFormatter 等)
│   │   │   │   └── ui/        # shadcn-vue UI 组件
│   │   │   ├── layouts/
│   │   │   ├── router/
│   │   │   └── views/     # 页面组件 (Notes, Tools, Ideas, Dashboard)
│   │   └── package.json
│   └── server/       # Fastify 后端 + Prisma (SQLite)
│       ├── prisma/
│       │   └── schema.prisma   # Note 模型 (id, title, content, tags, 时间戳)
│       ├── src/
│       │   └── index.ts        # API 路由：GET/POST/PUT/DELETE /api/notes
│       └── package.json
└── turbo.json        # Turbo 构建管道
```

## 命令

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev              # 运行所有包的开发模式 (Turbo)
pnpm --filter web dev     # 仅前端 (Vite, localhost)
pnpm --filter server dev  # 仅后端 (Fastify, 端口 3000)

# 构建
pnpm build          # 构建所有包
pnpm --filter web build     # 仅前端 (输出到 dist/)
pnpm --filter server build  # 仅后端 (输出到 dist/)

# 数据库
cd packages/server
npx prisma generate         # 生成 Prisma 客户端
npx prisma db push          # 同步 schema 到 SQLite (dev.db)

# Lint
pnpm lint
```

## 关键细节

- **前端**: Vue 3 + Composition API + `<script setup>`, Pinia 状态管理，Vue Router, shadcn-vue UI, Tailwind CSS, @vueuse 工具库
- **后端**: Fastify (已启用 CORS), Prisma ORM + SQLite, tags 以逗号分隔字符串存储
- **API**: RESTful 端点 `/api/notes`, 支持搜索 (`?search=`) 和标签筛选 (`?tag=`)
- **路径别名**: `@/*` 解析为 `packages/web/src/*`
- **环境变量**: 前端使用 `VITE_API_BASE_URL` (默认 `http://localhost:3000`), 后端使用 `DATABASE_URL` 供 Prisma

## 部署

GitHub Actions 在推送到 `main` 分支时自动部署：
1. 构建前端 (`packages/web/dist`) 和后端 (`packages/server/dist`)
2. 通过 rsync 同步到远程服务器
3. 执行 `prisma db push` 并重启 PM2 进程

## 开发注意事项

- 后端在数据库中将 tags 存为逗号分隔字符串，API 响应时转换为数组
- 前端使用 reka-ui (无头 UI 库) 提供 Sheet、Tooltip 等组件
- 服务器运行在端口 3000，开发模式下 CORS 允许所有来源
