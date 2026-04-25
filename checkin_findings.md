# Findings & Decisions: Conan 打卡系统
<!-- 
  WHAT: 打卡系统实施过程中的发现和决策记录。
  WHY: 上下文窗口有限，此文件作为"外部记忆"存储所有发现。
  WHEN: 根据2-Action Rule，每2次查看/浏览/搜索操作后更新。
-->

## Requirements
<!-- 
  WHAT: 用户需求分解为具体功能点。
  WHY: 保持需求可见，不忘记要构建的内容。
-->
- 财务记账模块：收入/支出记录、分类统计、流水查询
- 运动模块：运动记录、时长/距离/消耗统计
- 学习阅读模块：学习/阅读记录、内容追踪、进度管理
- 打卡日历：月视图，每日打卡情况可视化
- 统计图表：收支饼图、运动趋势折线图、学习时长柱状图
- AI智能功能：智能记账解析、每日简报、学习摘要、运动推荐
- 微信提醒：每日提醒、连续打卡成就通知、异常消费提醒
- 快捷打卡：Dashboard首页快捷入口
- 数据导出：各模块支持CSV导出

## Research Findings
<!-- 
  WHAT: 从代码探索、文档阅读或搜索中发现的关键信息。
  WHY: 多模态内容（图像、浏览器结果）不会持久化，必须立即记录。
-->

### 现有项目结构
**Monorepo架构**：
- `packages/web/` - Vue 3 + Vite + TypeScript 前端
- `packages/server/` - Fastify + Prisma + SQLite 后端
- `turbo.json` - Turbo构建管道配置
- `pnpm-workspace.yaml` - pnpm工作区配置

**后端架构**：
- **路由结构**：`packages/server/src/routes/`（auth.ts, ideas.ts, activities.ts等）
- **认证系统**：JWT + HTTP-Only Cookie，使用`@fastify/jwt`和`@fastify/cookie`
- **中间件**：`auth-middleware.ts`实现用户认证和隔离
- **数据库**：Prisma ORM + SQLite，模型包含User、Note、Idea、RecentActivity、NoteVersion
- **API设计**：RESTful风格，所有查询基于用户ID隔离

**前端架构**：
- **路由**：Vue Router 4，导航守卫实现认证检查和页面访问记录
- **状态管理**：Pinia stores（auth.ts, theme.ts, search.ts）
- **UI组件库**：shadcn-vue（reka-ui无头组件），已实现Button、Input、Card、Toast等组件
- **API调用**：axios封装，`src/api/`目录组织（notes.ts, ideas.ts, auth.ts等）
- **现有页面**：Dashboard、Notes、Ideas、Tools、Tags、Login、Register

### 可复用模式
1. **CRUD API模式**：现有笔记和灵感API提供完整的CRUD示例
2. **用户数据隔离**：所有数据查询基于当前用户ID，通过认证中间件实现
3. **表单处理**：NoteEditor组件展示完整的表单验证和保存逻辑
4. **列表展示**：NoteList组件展示分页、搜索、筛选、排序功能
5. **状态管理**：Pinia stores提供全局状态管理示例
6. **主题系统**：支持6种预设主题和深色模式切换

### 认证机制
- JWT存储在HTTP-Only Cookie中，防止XSS攻击
- 密码使用bcryptjs哈希
- 路由守卫检查登录状态，未登录重定向到登录页
- 用户ID从JWT解码，用于所有数据查询隔离

### 部署流程
- GitHub Actions自动部署到服务器
- 使用PM2管理后端进程
- Nginx反向代理配置
- 环境变量通过GitHub Secrets管理

## Technical Decisions
<!-- 
  WHAT: 架构和实施选择，附带理由。
  WHY: 记录技术决策的原因，便于后续维护。
-->
| Decision | Rationale |
|----------|-----------|
| 保持现有技术栈（Vue 3 + Fastify + Prisma） | 架构一致性，降低复杂性 |
| 复用现有JWT认证系统 | 用户系统已完善，无需重新实现 |
| AI服务多供应商降级策略 | 确保服务可用性，避免单点故障 |
| 企业微信群机器人而非自建应用 | MVP阶段简单可靠，免费稳定 |
| SQLite数据库（个人使用） | 单用户场景足够，部署简单 |
| 标签存储使用逗号分隔字符串 | 与现有Note、Idea模型保持一致，简化查询 |
| 打卡系统模型使用现有命名规范 | 保持代码一致性，便于维护 |
| 添加CheckinSummary表优化日历查询 | 避免每次查询多个表，提高性能 |
| 用户偏好单独存储为CheckinPreference | 支持个性化配置，便于扩展 |

## Issues Encountered
<!-- 
  WHAT: 遇到的问题及解决方案。
  WHY: 记录问题解决过程，避免重复错误。
-->
| Issue | Resolution |
|-------|------------|
| Prisma Schema验证错误：缺少双向关系字段 | 更新User模型添加financeRecords、exerciseRecords、studyRecords、checkinSummaries、checkinPreference关系字段 |
| Prisma Schema验证错误：缺少双向关系字段 | 更新Note模型添加studyRecords关系字段 |
| Prisma Schema验证错误：CheckinSummary缺少user关系字段 | 在CheckinSummary模型中添加user关系字段 |
| 权限错误：prisma generate文件重命名失败 | 可能是Windows文件锁定，需要重启或关闭占用进程 |

## Resources
<!-- 
  WHAT: URL、文件路径、API参考、文档链接。
  WHY: 便于后续参考，避免丢失重要链接。
-->
### 关键文件路径
- **后端核心文件**：
  - `packages/server/prisma/schema.prisma` - 数据库模型定义
  - `packages/server/src/routes/` - API路由目录
  - `packages/server/src/plugins/auth-middleware.ts` - JWT认证中间件
  - `packages/server/src/plugins/auth.ts` - 认证插件
  - `packages/server/src/index.ts` - Fastify服务器主文件
  
- **前端核心文件**：
  - `packages/web/src/router/index.ts` - 路由配置和导航守卫
  - `packages/web/src/stores/auth.ts` - 认证状态管理
  - `packages/web/src/api/` - API客户端封装
  - `packages/web/src/components/notes/` - 笔记相关组件（可复用模式）
  - `packages/web/src/views/Notes.vue` - 笔记页面（列表+编辑器模式）
  - `packages/web/src/components/ui/` - shadcn-vue UI组件库
  
- **项目配置**：
  - `turbo.json` - Turbo构建配置
  - `pnpm-workspace.yaml` - pnpm工作区配置
  - `CLAUDE.md` - 项目开发指南
  - `DEPLOY.md` - 部署文档

### API参考模式
1. **笔记API** (`src/api/notes.ts`) - 完整的CRUD示例
2. **认证API** (`src/api/auth.ts`) - 登录/注册/登出模式
3. **状态管理** (`src/stores/auth.ts`) - Pinia store实现
4. **组件通信** - 父子组件通过props/emit通信，复杂状态使用Pinia

### 开发命令
- `pnpm dev` - 启动开发服务器（前后端并行）
- `pnpm build` - 构建生产版本
- `pnpm --filter web dev` - 仅启动前端
- `pnpm --filter server dev` - 仅启动后端

## Visual/Browser Findings
<!-- 
  WHAT: 从查看图像、PDF或浏览器结果中获得的信息。
  WHY: 关键 - 视觉/多模态内容不会持久化在上下文中，必须立即捕获为文本。
-->
- 待添加：项目结构截图、现有API文档

---
<!-- 
  REMINDER: The 2-Action Rule
  每2次查看/浏览/搜索操作后，必须更新此文件。
  这可以防止上下文重置时视觉信息丢失。
-->
*每2次查看/浏览/搜索操作后更新此文件*
*防止视觉信息丢失*