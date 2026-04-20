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

## 任务 11：快速搜索面板

### 目标
为 Conan 平台添加全局快速搜索面板，支持 Cmd/Ctrl+K 快捷键打开，快速搜索笔记、灵感和工具，提升用户体验。

### 用户决策
| 问题 | 选择 |
|------|------|
| 搜索方式 | 统一搜索端点 vs 分别调用现有API | 分别调用现有API（更简单，利用现有功能） |
| 快捷键 | Cmd/Ctrl+K（标准快捷键） |
| 界面样式 | Sheet 模态框（与现有UI一致） |
| 键盘导航 | 支持 ↑↓ 箭头键、Enter、Esc |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 设计技术方案 | ✅ 完成 | 分析现有搜索功能，设计快速搜索面板架构 |
| 2. 创建统一搜索API（可选） | 🔄 跳过 | 选择分别调用现有API方案，不创建统一端点 |
| 3. 创建前端搜索组件 | ✅ 完成 | 创建 QuickSearch.vue、SearchResults.vue、SearchResultItem.vue、SearchInput.vue |
| 4. 实现全局快捷键 | ✅ 完成 | 使用 @vueuse/core 的 useMagicKeys 监听 Cmd/Ctrl+K，集成键盘导航 |
| 5. 集成到应用 | ✅ 完成 | 在 App.vue 中注册全局搜索组件，处理搜索结果选择事件 |
| 6. 搜索结果跳转 | ✅ 完成 | 实现选择搜索结果后的路由跳转逻辑 |
| 7. 测试与优化 | ✅ 完成 | MCP自动化测试通过，快捷键冲突已修复，所有功能验证通过 |

### 技术方案

#### 1. 全局快捷键监听
- 使用 `@vueuse/core` 的 `useMagicKeys` 监听 Cmd/Ctrl+K
- 在 App.vue 或全局组件中注册快捷键
- 打开/关闭搜索面板状态管理

#### 2. 搜索实现
- **笔记搜索**: 调用现有 `/api/notes?search=` 端点
- **灵感搜索**: 需要扩展灵感API支持搜索（新增 `/api/ideas?search=`）
- **工具搜索**: 本地搜索，搜索工具名称和描述
- **统一搜索端点（可选）**: 创建 `/api/search?q=` 聚合搜索结果

#### 3. 前端组件结构
```
QuickSearch.vue（主组件）
├── SearchInput.vue（搜索输入框）
├── SearchResults.vue（搜索结果列表）
│   ├── SearchResultItem.vue（单个结果项）
│   └── SearchCategory.vue（结果分类：笔记、灵感、工具）
└── KeyboardHelp.vue（键盘快捷键提示）
```

#### 4. 键盘导航
- ↑↓ 箭头键：导航搜索结果
- Enter：选择当前结果
- Esc：关闭搜索面板
- Cmd/Ctrl+K：切换搜索面板

#### 5. 样式设计
- 使用现有 Sheet 组件作为容器
- 符合现有设计语言
- 暗色/亮色模式适配

### 关键文件路径

**需要创建的文件**:
- `packages/web/src/components/search/QuickSearch.vue` - 快速搜索主组件
- `packages/web/src/components/search/SearchResults.vue` - 搜索结果列表
- `packages/web/src/components/search/SearchResultItem.vue` - 单个搜索结果项
- `packages/web/src/components/search/SearchInput.vue` - 搜索输入框

**需要修改的文件**:
- `packages/web/src/App.vue` - 注册全局搜索组件和快捷键
- `packages/web/src/api/ideas.ts` - 扩展灵感API支持搜索参数
- `packages/server/src/index.ts` - 扩展灵感搜索API（如需）
- `packages/server/src/routes/ideas.ts` - 添加搜索支持到灵感API

### 依赖安装
- `@vueuse/core`（如果尚未安装）：用于快捷键监听

---

## 任务 12：笔记收藏功能

### 目标
为笔记添加收藏功能，允许用户标记重要笔记，提供快速访问收藏笔记的视图。

### 用户决策
| 问题 | 选择 |
|------|------|
| 数据模型 | 在Note模型中添加isFavorite字段（简单直接） |
| 收藏状态切换 | 独立端点 PATCH /api/notes/:id/favorite |
| 收藏视图 | 独立的收藏页面 vs 笔记列表筛选 | 笔记列表筛选 + 收藏标签页 |
| UI位置 | 笔记卡片和编辑器添加收藏按钮 |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 设计技术方案 | ✅ 完成 | 确定数据模型、API设计、UI交互 |
| 2. 修改Prisma Schema | ✅ 完成 | 在Note模型中添加isFavorite布尔字段 |
| 3. 更新后端API | ✅ 完成 | 添加收藏状态切换端点，支持按收藏筛选 |
| 4. 更新前端API客户端 | ✅ 完成 | 添加收藏相关API函数 |
| 5. 实现收藏UI组件 | ✅ 完成 | 创建收藏按钮组件，集成到笔记列表和编辑器 |
| 6. 添加收藏视图 | ✅ 完成 | 在笔记页面添加收藏标签页，显示收藏笔记 |
| 7. 集成到快速搜索 | ✅ 完成 | 收藏笔记在搜索结果中特殊标记或优先显示 |
| 8. 测试与验证 | ✅ 完成 | TypeScript编译通过，构建成功 |

### 技术方案

#### 1. 数据模型修改
- 在Note模型中添加 `isFavorite` 布尔字段，默认 `false`
- 现有笔记的 `isFavorite` 字段默认为 `false`
- 不需要创建独立的Favorite模型（简化设计）

#### 2. 后端API扩展
1. **收藏状态切换**:
   - `PATCH /api/notes/:id/favorite` - 切换收藏状态
   - 请求体: `{ favorite: boolean }` 或空（toggle）
   - 返回更新后的笔记对象

2. **笔记列表筛选**:
   - 扩展 `GET /api/notes` 支持 `favorite` 查询参数
   - `?favorite=true` - 只返回收藏的笔记
   - `?favorite=false` - 只返回未收藏的笔记
   - 无参数 - 返回所有笔记

3. **现有API兼容性**:
   - 所有笔记API响应中返回 `isFavorite` 字段
   - 确保向后兼容

#### 3. 前端实现
1. **API客户端扩展** (`packages/web/src/api/notes.ts`):
   - `toggleFavorite(id: number, favorite?: boolean)`
   - `getFavoriteNotes()` 辅助函数

2. **收藏按钮组件**:
   - 使用Star或Heart图标
   - 点击切换收藏状态
   - 实时反馈（Toast提示）

3. **笔记列表集成**:
   - 每个笔记卡片添加收藏按钮
   - 收藏筛选标签页（全部/收藏/未收藏）

4. **笔记编辑器集成**:
   - 编辑器头部添加收藏按钮
   - 保存时不影响收藏状态

5. **收藏视图**:
   - 在笔记页面添加"收藏"标签页
   - 显示所有收藏笔记

6. **快速搜索集成**:
   - 收藏笔记在搜索结果中特殊标记（⭐图标）
   - 可考虑优先显示收藏笔记

### 关键文件路径

**需要修改的文件**:
- `packages/server/prisma/schema.prisma` - 添加isFavorite字段
- `packages/server/src/index.ts` - 添加收藏端点
- `packages/web/src/api/notes.ts` - 扩展API客户端
- `packages/web/src/components/notes/NoteCard.vue` - 添加收藏按钮
- `packages/web/src/components/notes/NoteEditor.vue` - 添加收藏按钮
- `packages/web/src/views/Notes.vue` - 添加收藏标签页和筛选
- `packages/web/src/components/search/SearchResultItem.vue` - 收藏标记

**可能需要创建的文件**:
- `packages/web/src/components/notes/FavoriteButton.vue` - 可复用的收藏按钮组件

### 用户体验设计
1. **直观的收藏交互**: 点击星形图标切换收藏状态
2. **即时反馈**: 图标状态立即更新，Toast提示操作结果
3. **多入口**: 支持在列表和编辑器中收藏
4. **快速访问**: 收藏标签页提供快速访问收藏笔记
5. **视觉突出**: 收藏笔记在列表中特殊标记

### 默认行为
- 新笔记默认未收藏
- 收藏状态与用户绑定（用户隔离）
- 收藏操作记录到最近访问活动

### 完成总结

笔记收藏功能已全部完成，包括：

- ✅ **数据模型**: 在 Note 模型中添加 `isFavorite` 布尔字段，默认 `false`
- ✅ **后端API**: 
  - 扩展 `GET /api/notes` 支持 `favorite` 查询参数 (`?favorite=true/false`)
  - 新增 `PATCH /api/notes/:id/favorite` 端点切换收藏状态
- ✅ **前端API客户端**: 添加 `toggleFavorite` 和 `getFavoriteNotes` 函数
- ✅ **收藏按钮组件**: 创建 `FavoriteButton.vue` 组件，支持星形图标切换
- ✅ **笔记列表集成**: 每个笔记卡片添加收藏按钮，支持收藏筛选标签页（全部/收藏/未收藏）
- ✅ **笔记编辑器集成**: 编辑器头部添加收藏按钮
- ✅ **快速搜索集成**: 收藏笔记在搜索结果中显示⭐图标标记

所有功能均已通过 TypeScript 编译和构建验证。

---

## 任务 13：标签云功能

### 目标
为 Conan 平台添加标签云功能，可视化展示所有标签及使用频率，帮助用户发现热门标签和快速导航。

### 用户决策
| 问题 | 选择 |
|------|------|
| 标签云位置 | 集成到仪表盘页面 + 独立标签页面 |
| 可视化样式 | 根据频率调整字体大小和颜色 |
| 交互方式 | 点击标签筛选相关笔记/灵感 |
| 数据来源 | 同时包含笔记和灵感的标签 |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 设计技术方案 | ✅ 完成 | 确定数据模型、API设计、UI交互 |
| 2. 实现后端API | ✅ 完成 | 创建 `/api/tags/cloud` 端点，统计标签频率 |
| 3. 实现前端API客户端 | ✅ 完成 | 创建标签云API客户端函数 |
| 4. 创建标签云组件 | ✅ 完成 | 创建 TagCloud.vue 可视化组件 |
| 5. 集成到仪表盘 | ✅ 完成 | 在仪表盘页面添加标签云模块 |
| 6. 创建独立标签页面 | ✅ 完成 | 创建 Tags.vue 页面展示完整标签云 |
| 7. 测试与验证 | ✅ 完成 | TypeScript编译、构建测试、MCP测试 |

### 技术方案

#### 1. 后端API设计

**端点**: `GET /api/tags/cloud`
- **功能**: 获取所有标签及其使用频率
- **用户隔离**: 只统计当前用户的笔记和灵感
- **返回格式**:
  ```typescript
  {
    tags: Array<{
      name: string;
      count: number;
      type: 'note' | 'idea' | 'both';
    }>
  }
  ```

**算法逻辑**:
1. 查询当前用户的所有笔记和灵感
2. 提取所有标签（逗号分隔字符串 → 数组）
3. 统计每个标签在笔记和灵感中的出现次数
4. 计算总使用频率
5. 按频率降序排序
6. 返回前N个标签（如50个）

#### 2. 前端架构

**API客户端** (`packages/web/src/api/tags.ts`):
- `getTagCloud(): Promise<TagCloudItem[]>`

**标签云组件** (`packages/web/src/components/tags/TagCloud.vue`):
- Props: `tags: TagCloudItem[]`, `maxFontSize?: number`, `minFontSize?: number`
- 根据频率计算字体大小和颜色
- 点击标签触发筛选事件

**标签页面** (`packages/web/src/views/Tags.vue`):
- 独立页面展示完整标签云
- 支持搜索和筛选标签

**仪表盘集成** (`packages/web/src/views/Dashboard.vue`):
- 添加标签云模块，显示热门标签

#### 3. 用户体验设计

1. **可视化效果**:
   - 字体大小: 根据频率线性或对数比例调整
   - 颜色: 根据频率或类型使用不同颜色方案
   - 布局: Cloud布局，标签随机分布

2. **交互功能**:
   - 鼠标悬停: 显示标签详情（使用频率）
   - 点击标签: 筛选相关笔记/灵感
   - 右键菜单: 更多操作选项（可选）

3. **性能优化**:
   - 标签数据缓存
   - 防抖搜索
   - 虚拟滚动（标签数量多时）

### 关键文件路径

**需要创建的文件**:
- `packages/web/src/api/tags.ts` - 标签API客户端
- `packages/web/src/components/tags/TagCloud.vue` - 标签云可视化组件
- `packages/web/src/views/Tags.vue` - 标签页面
- `packages/web/src/router/tags.ts` - 标签页面路由（可选）

**需要修改的文件**:
- `packages/server/src/index.ts` - 添加 `/api/tags/cloud` 端点
- `packages/web/src/views/Dashboard.vue` - 集成标签云模块
- `packages/web/src/router/index.ts` - 添加标签页面路由

### 技术挑战与解决方案

#### 1. 标签统计性能
- **挑战**: 用户可能有大量笔记和灵感，统计所有标签可能影响性能
- **解决方案**: 
  - 限制返回标签数量（如前50个）
  - 添加缓存机制（如5分钟缓存）
  - 后台异步计算（未来扩展）

#### 2. 可视化布局
- **挑战**: 创建美观的标签云布局
- **解决方案**:
  - 使用CSS Grid或Flexbox实现简单布局
  - 考虑第三方库如`vue-wordcloud`（可选）
  - 自定义布局算法（按频率排序）

#### 3. 响应式设计
- **挑战**: 在不同屏幕尺寸下保持标签云可读性
- **解决方案**:
  - 移动端使用简化布局（列表形式）
  - 根据屏幕尺寸调整标签数量
  - 支持缩放和滚动

### 完成标准

1. ✅ 后端API端点可用，返回正确的标签统计数据
2. ✅ 标签云组件正确显示标签，字体大小和颜色反映频率
3. ✅ 点击标签能正确筛选相关笔记/灵感
4. ✅ 仪表盘集成了标签云模块
5. ✅ 独立标签页面可用
6. ✅ TypeScript编译通过，无错误
7. ✅ MCP自动化测试通过

### 未来扩展

1. **高级功能**:
   - 标签合并（同义词处理）
   - 标签分组（分类管理）
   - 标签趋势（随时间变化）

2. **用户体验优化**:
   - 标签编辑（重命名、合并、删除）
   - 标签导入/导出
   - 标签云动画效果

3. **性能优化**:
   - 标签索引优化
   - 实时标签统计
   - 分布式标签计算（大数据量）

---

## 任务 14：笔记历史版本功能

### 目标
为笔记添加历史版本功能，允许用户查看笔记的修改历史、恢复到历史版本，提升数据安全性和可追溯性。

### 用户决策
| 问题 | 选择 |
|------|------|
| 数据模型 | 创建独立的 NoteVersion 模型，存储完整历史版本 |
| 版本创建时机 | 每次保存时创建新版本（自动版本控制） |
| 版本保留策略 | 保留所有历史版本，或按时间/数量限制 |
| 恢复方式 | 恢复到历史版本，创建新版本或覆盖当前版本 |
| 用户界面 | 时间线视图显示历史版本，支持版本对比 |

### 阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 1. 设计技术方案 | ✅ 完成 | 确定数据模型、API设计、UI交互 |
| 2. 创建数据模型 | ✅ 完成 | 在 Prisma 中添加 NoteVersion 模型 |
| 3. 实现后端 API | ✅ 完成 | 创建版本管理端点（获取历史、创建版本、恢复版本） |
| 4. 实现前端 API 客户端 | ✅ 完成 | 添加版本管理 API 函数 |
| 5. 创建历史版本 UI 组件 | ✅ 完成 | 时间线组件、版本对比组件 |
| 6. 集成到笔记编辑器 | ✅ 完成 | 在 NoteEditor 中添加历史版本面板 |
| 7. 测试与验证 | ✅ 完成 | TypeScript编译、构建测试、MCP测试 |

### 技术方案

#### 1. 数据模型设计
```prisma
model NoteVersion {
  id          Int      @id @default(autoincrement())
  noteId      Int
  note        Note     @relation(fields: [noteId], references: [id])
  title       String
  content     String
  tags        String   // 逗号分隔的标签字符串
  version     Int      // 版本号，从1开始递增
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 更新 Note 模型，添加 version 字段
model Note {
  // 现有字段...
  versions    NoteVersion[]  // 关联关系
  currentVersion Int @default(1)  // 当前版本号
}
```

#### 2. API 端点设计
- `GET /api/notes/:id/versions` - 获取笔记的所有历史版本
- `GET /api/notes/:id/versions/:versionId` - 获取特定历史版本
- `POST /api/notes/:id/versions` - 创建新版本（自动或手动）
- `POST /api/notes/:id/restore` - 恢复到特定历史版本
- `DELETE /api/notes/:id/versions/:versionId` - 删除历史版本

#### 3. 版本控制策略
1. **自动版本创建**：每次保存笔记时自动创建新版本
2. **版本号管理**：递增版本号，记录当前版本号
3. **数据存储**：存储完整的笔记快照（标题、内容、标签）
4. **用户隔离**：只允许笔记所有者访问历史版本

#### 4. 前端实现
1. **历史版本面板**：在编辑器侧边或底部显示时间线
2. **版本对比**：并排显示两个版本的内容差异
3. **恢复操作**：确认对话框，支持恢复为当前版本或创建新版本
4. **版本筛选**：按时间、标签、关键词筛选历史版本





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
