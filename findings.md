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

## 知识库增强功能

### 全文搜索实现
- 已集成到现有搜索 API (`GET /api/notes?search=`)
- 使用 Prisma 的 `contains` 操作符搜索标题和内容
- 前端 NoteList 组件已支持搜索框

### 笔记关联算法
- **标签匹配**: 基于共享标签数量计算相关性
- **匹配度计算**: `matchScore = 共享标签数量`
- **排序**: 按 `matchScore` 降序，相同分数按更新时间降序
- **回退策略**: 如果没有标签，返回最近的笔记

### 前端实现模式
1. **API 客户端**: 添加 `getRelatedNotes` 函数
2. **响应式状态**: `relatedNotes`, `showRelated`
3. **生命周期**: 在 `watch` 中加载相关笔记
4. **UI 组件**: 显示相关笔记列表，带匹配度 Badge
5. **事件处理**: `select` 事件导航到相关笔记

### 技术决策
- **简单标签匹配** vs 复杂 NLP/向量搜索：当前用户量小，标签匹配足够
- **实时计算** vs 预计算索引：数据量小，实时计算性能可接受
- **前端缓存**：未实现，可后续优化

### 推迟的功能
- **标签云**: 需要统计所有标签使用频率，UI 复杂
- **快速搜索面板**: 需要全局快捷键和搜索 API 优化
- **笔记收藏**: 需要扩展 Note 模型，添加 `isFavorite` 字段
- **历史版本**: 需要创建 NoteVersion 模型，存储差异

### 部署注意事项
- 前端 API 使用相对路径 (`baseURL: ''`) 支持 Nginx 反向代理
- 生产环境需要配置 Nginx 代理 `/api` 到后端
- 环境变量分离：开发环境 `.env.development`，生产环境 `.env.production`

---

## 自定义主题系统

### 技术方案
- **CSS 变量系统**: 使用数据属性 `[data-theme="theme-id"]` 覆盖 CSS 变量
- **状态管理**: Pinia store 管理主题状态，支持 localStorage 持久化
- **预设主题**: 8个精心设计的主题（默认、蓝色、绿色、紫色、橙色、粉红、青色、深色）
- **深色模式**: 独立于主题的深色模式切换，与现有 theme-toggle 组件兼容

### 实现细节
1. **CSS 架构**: 在 `:root` 中定义基础变量，主题选择器覆盖 `--primary`、`--primary-hover`、`--ring` 变量
2. **深色模式兼容**: `.dark` 类与 `[data-theme="dark"]` 选择器并存，支持组合使用
3. **DOM 操作**: 通过 JavaScript 动态设置 `data-theme` 属性和 `.dark` 类
4. **持久化**: 主题设置保存到 localStorage，支持页面刷新后恢复

### 预设主题颜色选择
- **蓝色主题** (221.2° 83.2% 53.3%): 专业、信任
- **绿色主题** (142.1° 76.2% 36.3%): 清新、自然
- **紫色主题** (262.1° 83.3% 57.8%): 创意、神秘
- **橙色主题** (24.6° 95% 53.1%): 活力、热情
- **粉红主题** (346.8° 77.2% 49.8%): 浪漫、温柔
- **青色主题** (188.7° 94.5% 42.7%): 科技、现代

### 用户交互设计
1. **主题选择器**: 网格布局展示主题卡片，包含颜色预览和图标
2. **实时预览**: 主题切换立即生效，无需刷新页面
3. **深色模式切换**: 独立开关，可与任何主题组合
4. **操作反馈**: Toast 提示确认操作成功

### 推迟的功能
- **颜色选择器**: 自定义主题颜色（需要更复杂的颜色管理）
- **用户配置同步**: 将主题设置保存到后端用户配置
- **系统主题跟随**: 自动跟随操作系统深色/浅色模式偏好
