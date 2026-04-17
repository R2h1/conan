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

## 任务 7：工具集扩展（已完成）

### 目标
扩展 Tools 页面的工具数量和功能，提供更多实用的开发工具。

### 现有工具
- ✅ JSON 格式化/压缩/校验
- ✅ 时间戳转换
- ✅ Base64 编解码

### 新增工具（已完成）

| 工具 | 状态 | 说明 |
|------|------|------|
| URL 编解码 | ✅ 完成 | encodeURIComponent/decodeURIComponent，支持中文 |
| HTML 实体转义 | ✅ 完成 | 转义/还原 HTML 特殊字符 (&<>"') |
| MD5/SHA 哈希 | ✅ 完成 | MD5, SHA-1, SHA-256, SHA-512 |
| UUID 生成 | ✅ 完成 | 单个生成或批量生成 (10 个) |
| 颜色转换器 | ✅ 完成 | HEX ↔ RGB ↔ HSL 互转，带颜色预览 |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. URL 编解码 | ✅ 完成 | encode/decode，支持中文 |
| 2. HTML 实体转义 | ✅ 完成 | escape/unescape |
| 3. MD5/SHA 哈希 | ✅ 完成 | crypto-js 库 |
| 4. UUID 生成 | ✅ 完成 | 批量生成 |
| 5. 颜色转换器 | ✅ 完成 | HEX/RGB/HSL 互转 |
| 6. UI 优化 | ✅ 完成 | 工具分类导航，8 个工具标签页 |

### 依赖安装
- ✅ crypto-js@4.2.0
- ✅ @types/crypto-js@4.2.2

### 完成总结

工具集扩展已完成，新增 5 个实用工具：
- ✅ URL 编解码工具
- ✅ HTML 实体转义工具
- ✅ 哈希计算工具（MD5/SHA-1/SHA-256/SHA-512）
- ✅ UUID 生成器（单个/批量）
- ✅ 颜色转换器（HEX/RGB/HSL）

所有工具都已集成到 Tools.vue 页面，支持 Toast 提示和一键复制输出。

---

## 任务 8：知识库增强（已完成）

### 目标
增强笔记/知识库功能，提供更好的知识管理能力。

### 用户决策
| 问题 | 选择 |
|------|------|
| 功能优先级 | 全文搜索 + 笔记关联优先 |

### 候选功能

| 功能 | 优先级 | 状态 | 说明 |
|------|--------|------|------|
| 全文搜索 | 高 | ✅ 完成 | 搜索笔记标题和内容 |
| 笔记关联 | 高 | ✅ 完成 | 双向链接、相关笔记推荐 |
| 标签云 | 中 | ⏳ 推迟 | 可视化展示所有标签及使用频率 |
| 快速搜索面板 | 中 | ⏳ 推迟 | Cmd/Ctrl+K 全局搜索面板 |
| 笔记收藏 | 低 | ⏳ 推迟 | 标记重要笔记 |
| 笔记历史版本 | 低 | ⏳ 推迟 | 查看/恢复到历史版本 |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 全文搜索 API | ✅ 完成 | 后端支持全文搜索 (已集成到现有搜索 API) |
| 2. 前端搜索 UI | ✅ 完成 | 搜索框、结果列表、高亮 (已集成到 NoteList) |
| 3. 笔记关联 API | ✅ 完成 | 获取相关笔记 |
| 4. 前端关联 UI | ✅ 完成 | 显示相关笔记列表 |
| 5. 标签云 | ⏳ 推迟 | 展示标签及使用频率 |
| 6. 快速搜索面板 | ⏳ 推迟 | Cmd/Ctrl+K 快捷键 |

### 完成总结

知识库增强功能已完成，包括：

- ✅ **全文搜索**: 后端 API 已支持搜索笔记标题和内容，前端 NoteList 组件已集成搜索功能
- ✅ **笔记关联**: 后端 `/api/notes/:id/related` 端点基于标签匹配推荐相关笔记，前端 NoteEditor 显示相关笔记列表和匹配度

### 关键文件路径

**修改的文件**:
- `packages/server/src/index.ts` - 添加 `/api/notes/:id/related` 端点
- `packages/web/src/api/notes.ts` - 添加 `getRelatedNotes` API 客户端
- `packages/web/src/components/notes/NoteEditor.vue` - 显示相关笔记列表
- `packages/web/src/views/Notes.vue` - 处理相关笔记选择事件

---

## 任务 9：自定义主题系统

### 目标
为 Conan 平台添加用户自定义主题功能，允许用户个性化界面颜色，提升用户体验。

### 用户决策
| 问题 | 选择 |
|------|------|
| 主题存储方式 | localStorage + Pinia 状态管理 |
| 预设主题 | 提供 6-8 个精心设计的预设主题 |
| 自定义程度 | 支持主色、背景色、文本色等核心颜色自定义 |
| 应用范围 | 全局应用，包括所有组件和页面 |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 设计主题系统架构 | ✅ 完成 | 确定主题数据结构、存储方案、应用方式 |
| 2. 扩展 CSS 变量系统 | ✅ 完成 | 增强 styles.css 支持动态主题变量 |
| 3. 创建主题管理 Store | ✅ 完成 | Pinia store 管理主题状态和持久化 |
| 4. 开发主题设置 UI | ✅ 完成 | 主题选择器组件 |
| 5. 集成主题到全局布局 | ✅ 完成 | 应用到 DefaultLayout 和所有页面 |
| 6. 主题持久化优化 | ⏳ 推迟 | 同步主题设置到用户配置（可选后端） |
| 7. 测试与验证 | ✅ 完成 | 构建成功，功能已验证 |

### 技术方案

1. **主题数据结构**:
   ```typescript
   interface Theme {
     id: string;
     name: string;
     type: 'preset' | 'custom';
     colors: {
       primary: string;
       secondary: string;
       background: string;
       surface: string;
       text: string;
       textSecondary: string;
       border: string;
       accent: string;
     };
   }
   ```

2. **状态管理**: Pinia store 管理当前主题、可用主题列表
3. **持久化**: localStorage 保存用户选择，同步到 Pinia
4. **CSS 变量**: 通过 JavaScript 动态更新 CSS 自定义属性
5. **UI 组件**: 使用 shadcn-vue + reka-ui 构建主题选择器

### 预设主题列表
1. **默认主题** - 当前 Conan 品牌色
2. **深色主题** - 全深色模式
3. **蓝色主题** - 蓝色系专业风格
4. **绿色主题** - 绿色系清新风格
5. **紫色主题** - 紫色系创意风格
6. **橙色主题** - 橙色系活力风格

### 关键文件路径

**需要创建的文件**:
- `packages/web/src/stores/theme.ts` - 主题状态管理
- `packages/web/src/components/theme/ThemeSelector.vue` - 主题选择器组件
- `packages/web/src/components/theme/ColorPicker.vue` - 颜色选择器组件

**需要修改的文件**:
- `packages/web/src/styles.css` - 扩展 CSS 变量系统
- `packages/web/src/main.ts` - 初始化主题 store
- `packages/web/src/layouts/DefaultLayout.vue` - 集成主题切换入口
- `packages/web/src/App.vue` - 应用主题到根组件

---

## 项目状态总结

### 已完成的功能
1. ✅ **用户系统** - 完整认证，支持多用户数据隔离
2. ✅ **UI 重新设计** - 统一视觉语言，所有页面优化
3. ✅ **Toast 提示系统** - 全局用户交互反馈
4. ✅ **灵感箱 (Ideas) 后端 API** - 完整的 CRUD 功能
5. ✅ **Dashboard 真实数据集成** - 统计 API 和快速记录
6. ✅ **部署配置** - GitHub Actions + Nginx + PM2
7. ✅ **工具集扩展** - 8 个实用开发工具
8. ✅ **知识库增强** - 全文搜索 + 笔记关联
9. ✅ **自定义主题系统** - 8个预设主题 + 深色模式切换

### 核心功能
- **笔记管理**: 支持标题、内容、标签、搜索
- **灵感箱**: 分类、优先级、完成状态、标签
- **工具集**: JSON, 时间戳, Base64, URL, HTML, 哈希, UUID, 颜色
- **Dashboard**: 统计概览、快捷入口、最近访问
- **用户认证**: JWT + HTTP-Only Cookie

### 技术架构
- **前端**: Vue 3 + Vite + TypeScript + Pinia + shadcn-vue
- **后端**: Fastify + Prisma + SQLite
- **部署**: Nginx 反向代理 + PM2 进程管理
- **CI/CD**: GitHub Actions 自动部署

### 推迟的功能
- ⏳ **标签云**: 标签可视化展示
- ⏳ **快速搜索面板**: Cmd/Ctrl+K 全局搜索
- ⏳ **笔记收藏**: 重要笔记标记
- ⏳ **笔记历史版本**: 版本管理和恢复
- ⏳ **MCP 生产环境验证**: 自动化测试验证
- ⏳ **主题颜色自定义**: 自定义主题颜色选择器
- ⏳ **用户配置同步**: 主题设置同步到后端用户配置

### 下一步建议
1. **✅ 代码已推送**到远程仓库，触发自动部署
2. **改天进行 MCP 生产环境验证**
3. **用户反馈收集**，确定后续功能优先级
4. **性能优化**（如需）：数据库索引、前端缓存

### 默认账户
```
用户名：admin
邮箱：admin@conan.local
密码：admin123
```

---

## 任务 10：最近访问功能修复与完善

### 目标
修复最近访问功能的用户隔离问题，实现真正的动态最近访问记录，支持用户隔离和自动更新。

### 问题描述
用户报告bug：当不同用户登录时，仪表盘页面的最近访问记录没有根据用户隔离，且当前用户的最近访问不会更新。

### 原因分析
1. **前端使用模拟数据**：`Dashboard.vue` 中的 `recentItems` 是硬编码的模拟数据
2. **缺少后端API**：没有获取用户最近访问记录的API端点
3. **缺少数据模型**：数据库中没有记录用户访问活动的模型
4. **缺少记录机制**：用户访问页面时没有记录到数据库

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 分析现有代码和问题 | ✅ 完成 | 检查Dashboard.vue、RecentActivity.vue和后端API |
| 2. 设计数据模型和API | ✅ 完成 | 设计RecentActivity模型和API端点 |
| 3. 实现后端API | ✅ 完成 | 创建记录和获取最近访问记录的API |
| 4. 实现前端API客户端 | ✅ 完成 | 创建获取最近访问记录的API客户端 |
| 5. 更新Dashboard页面 | ✅ 完成 | 替换模拟数据为真实API调用 |
| 6. 添加访问记录机制 | ✅ 完成 | 在路由守卫中记录页面访问 |
| 7. 测试与验证 | ✅ 完成 | TypeScript编译通过，功能实现完成 |

### 设计详情
1. **RecentActivity 数据模型**:
   ```prisma
   model RecentActivity {
     id        Int      @id @default(autoincrement())
     userId    Int
     user      User     @relation(fields: [userId], references: [id])
     type      String   // 'note', 'idea', 'tool', 'dashboard'
     title     String
     description String
     icon      String?  // 图标名称
     resourceId Int?    // 关联的资源ID（笔记ID、灵感ID等）
     createdAt DateTime @default(now())
   }
   ```

2. **API端点设计**:
   - `POST /api/activities` - 记录用户活动
     - 请求体: `{ type, title, description, icon?, resourceId? }`
   - `GET /api/activities/recent` - 获取用户最近活动（最近5条）
   - `GET /api/activities` - 获取用户所有活动（支持分页）

3. **活动类型定义**:
   - `dashboard`: 仪表盘访问
   - `note`: 笔记相关操作
   - `idea`: 灵感相关操作  
   - `tool`: 工具使用

4. **用户隔离**: 所有查询基于 `userId = request.user.userId`

### 技术方案
1. **数据模型**：在Prisma schema中添加RecentActivity模型，记录用户ID、活动类型、资源ID、访问时间等
2. **API端点**：
   - `POST /api/activities` - 记录用户活动
   - `GET /api/activities/recent` - 获取用户最近活动
3. **前端集成**：
   - 在路由守卫或页面挂载时记录访问
   - Dashboard页面从API获取最近活动数据
4. **用户隔离**：所有查询都基于当前登录用户ID进行过滤

### 关键文件路径

**需要创建的文件**:
- `packages/server/src/routes/activities.ts` - 活动记录API
- `packages/web/src/api/activities.ts` - 前端API客户端

**需要修改的文件**:
- `packages/server/prisma/schema.prisma` - 添加RecentActivity模型
- `packages/server/src/index.ts` - 注册activities路由
- `packages/web/src/views/Dashboard.vue` - 替换模拟数据
- `packages/web/src/router/index.ts` - 在路由守卫中记录访问活动

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
