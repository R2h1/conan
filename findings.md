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

---

## 最近访问功能修复与代码推送

### 问题解决
2026-04-17 修复了最近访问功能的用户隔离和动态更新问题。

### 技术实现
1. **RecentActivity 数据模型**: 添加用户ID、活动类型、标题、描述、图标、资源ID、创建时间字段
2. **后端API**: 创建活动记录API，支持记录、获取、删除用户活动
3. **前端集成**: Dashboard页面从API动态加载最近访问记录，替换模拟数据
4. **访问记录机制**: 在路由守卫中自动记录用户页面访问（/app, /app/notes, /app/ideas, /app/tools）
5. **用户隔离**: 所有查询基于当前登录用户ID，确保不同用户看到各自的最近访问记录

### 代码推送
- **提交哈希**: `4756918`
- **提交消息**: `feat: 修复最近访问功能的用户隔离和动态更新`
- **推送时间**: 2026-04-17
- **远程仓库**: `https://github.com/R2h1/conan.git`
- **状态**: ✅ 成功推送到远程主分支，触发 GitHub Actions 自动部署

### 功能特性
1. **用户隔离**: 每个用户看到自己的最近访问记录
2. **动态更新**: 页面访问自动记录和更新
3. **实时加载**: Dashboard页面加载时自动从API获取最新活动
4. **类型安全**: 完整的 TypeScript 类型支持

### 关键文件
- `packages/server/src/routes/activities.ts`
- `packages/web/src/api/activities.ts`
- `packages/web/src/views/Dashboard.vue`
- `packages/web/src/router/index.ts`

### 部署状态
✅ 代码已推送到远程仓库，等待 GitHub Actions 自动部署流程完成。

---

## 快速搜索面板技术方案（任务11）

### 背景
快速搜索面板是 Conan 平台的核心功能扩展，提供全局搜索能力，让用户能够快速查找笔记、灵感和工具。

### 当前搜索功能现状
1. **笔记搜索**: 已有完整实现
   - 后端: `/api/notes?search=` 支持标题和内容搜索
   - 前端: `NoteList.vue` 有搜索框，调用 `getNotes({search})`
2. **灵感搜索**: 缺少搜索功能
   - 后端: 没有 `search` 参数支持
   - 前端: `Ideas.vue` 只有分类筛选，无搜索框
3. **工具搜索**: 本地搜索，无统一搜索功能
4. **全局搜索**: 不存在

### 技术设计

#### 1. 搜索策略
- **方案A（推荐）**: 分别调用现有API
  - 笔记: 调用 `/api/notes?search=`
  - 灵感: 扩展 `/api/ideas` 支持 `search` 参数
  - 工具: 本地搜索工具名称和描述
- **方案B（优化）**: 统一搜索端点 `/api/search?q=`
  - 优点: 一次请求获取所有结果，性能更好
  - 缺点: 需要额外开发

#### 2. 前端架构

**组件层次**:
```
QuickSearch.vue（主组件，快捷键监听）
├── SearchInput.vue（搜索输入框，实时触发）
├── SearchResults.vue（搜索结果列表）
│   ├── SearchCategory.vue（结果分类：笔记、灵感、工具）
│   └── SearchResultItem.vue（单个结果项，点击跳转）
└── KeyboardHelp.vue（键盘快捷键提示）
```

**状态管理**:
- 使用 Pinia store 管理搜索状态
- 状态字段: `open`, `query`, `results`, `loading`, `selectedIndex`

#### 3. 键盘导航实现
```typescript
// 键盘事件监听
useEventListener('keydown', (event) => {
  if (!searchStore.open) return;
  
  switch (event.key) {
    case 'ArrowDown':
      searchStore.selectNext();
      break;
    case 'ArrowUp':
      searchStore.selectPrevious();
      break;
    case 'Enter':
      searchStore.selectCurrent();
      break;
    case 'Escape':
      searchStore.close();
      break;
  }
});
```

#### 4. 全局快捷键集成
```typescript
// 使用 @vueuse/core 的 useMagicKeys
const keys = useMagicKeys();
const { open, close, toggle } = useSearchStore();

watch(() => keys['ctrl+k'] || keys['cmd+k'], (v) => {
  if (v) toggle();
});
```

### API 扩展需求

#### 1. 灵感搜索支持
**当前API**: `GET /api/ideas`
**需要扩展**: 支持 `search` 查询参数
```typescript
// 查询逻辑
if (search) {
  where.OR = [
    { title: { contains: search } },
    { content: { contains: search } },
  ];
}
```

#### 2. 统一搜索端点（可选）
```typescript
// API 设计
GET /api/search?q=<query>&limit=5
// 返回格式
{
  "notes": [...],
  "ideas": [...],
  "tools": [...],
  "total": 15
}
```

### 用户体验设计

#### 1. 打开方式
- **快捷键**: Cmd/Ctrl+K
- **视觉反馈**: 输入框自动聚焦，清空上次搜索

#### 2. 搜索交互
- **实时搜索**: 输入时自动搜索（防抖 300ms）
- **加载状态**: 搜索时显示加载指示器
- **空状态**: 无结果时显示提示信息

#### 3. 结果展示
- **分类显示**: 笔记、灵感、工具分组
- **高亮匹配**: 搜索词在结果中高亮显示
- **上下文预览**: 显示相关片段（前50字符）

#### 4. 键盘导航
- **↑↓**: 导航结果项
- **Enter**: 选择并跳转
- **Esc**: 关闭面板
- **Tab**: 在类别间切换

### 技术挑战与解决方案

#### 1. 性能优化
- **防抖搜索**: 避免频繁API调用
- **结果缓存**: 缓存近期搜索结果
- **并行请求**: 同时搜索笔记和灵感

#### 2. 状态同步
- **Pinia 持久化**: 搜索历史存储到 localStorage
- **实时同步**: 搜索结果与数据源同步

#### 3. 响应式设计
- **移动端适配**: Sheet 模态框在移动端全屏显示
- **键盘支持**: 移动端虚拟键盘交互优化

### 文件清单

#### 需要创建的文件
- `packages/web/src/components/search/QuickSearch.vue` - 主组件
- `packages/web/src/components/search/SearchResults.vue` - 结果列表
- `packages/web/src/components/search/SearchResultItem.vue` - 单个结果
- `packages/web/src/components/search/SearchInput.vue` - 输入框
- `packages/web/src/stores/search.ts` - 搜索状态管理

#### 需要修改的文件
- `packages/web/src/App.vue` - 注册全局组件
- `packages/web/src/api/ideas.ts` - 扩展搜索支持
- `packages/server/src/routes/ideas.ts` - 添加搜索逻辑
- `packages/web/src/views/Ideas.vue` - 集成搜索功能（可选）

### 依赖检查
- `@vueuse/core`: 需要安装，用于快捷键监听
- 现有依赖: shadcn-vue, reka-ui 已满足UI需求

### 测试计划
1. **单元测试**: 搜索逻辑、键盘导航
2. **集成测试**: API调用、结果展示
3. **用户测试**: 快捷键响应、跳转逻辑
4. **性能测试**: 搜索响应时间、并发处理

---

## 快速搜索面板实现详情（任务11）

### 实现状态
✅ 功能已全部实现，代码已就绪，等待测试

### 实现细节

#### 1. 后端扩展
**修改文件**: `packages/server/src/routes/ideas.ts`
```typescript
// 扩展查询参数接口
interface QueryParams {
  // ... 原有字段
  search?: string;  // 新增搜索参数
}

// 添加搜索逻辑
if (query.search) {
  where.OR = [
    { title: { contains: query.search } },
    { content: { contains: query.search } },
  ];
}
```

**前端API同步**: `packages/web/src/api/ideas.ts`
- 扩展 `GetIdeasParams` 接口，添加 `search?: string`
- 现有 `getIdeas` 函数自动支持传递 `search` 参数

#### 2. 前端状态管理
**搜索Store架构** (`packages/web/src/stores/search.ts`)
- **状态管理**: `open`, `query`, `results`, `loading`, `selectedIndex`
- **搜索函数**: 并行搜索笔记、灵感、工具
- **键盘导航**: `selectNext()`, `selectPrevious()`, `selectCurrent()`
- **工具列表**: 硬编码8个工具信息，支持本地搜索

**搜索流程**:
1. 用户输入搜索词（防抖300ms）
2. 并行调用笔记API和灵感API
3. 本地搜索工具列表
4. 合并结果，按类型分组
5. 更新状态，显示结果

#### 3. 组件架构

**组件层次**:
```
QuickSearch.vue（主组件）
├── Sheet（模态框容器）
├── SearchInput.vue（输入框，防抖300ms）
└── SearchResults.vue（结果列表）
    ├── SearchCategory（笔记、灵感、工具分组）
    └── SearchResultItem.vue（单个结果项）
```

**键盘交互**:
- **Cmd/Ctrl+K**: 打开/关闭搜索面板
- **↑↓ 箭头键**: 导航搜索结果
- **Enter**: 选择当前结果，触发路由跳转
- **Escape**: 关闭搜索面板

#### 4. 全局集成

**App.vue集成**:
```typescript
// 注册全局组件
<QuickSearch @select="handleSearchSelect" />

// 处理搜索结果选择
const handleSearchSelect = (result) => {
  switch (result.type) {
    case 'note':
      router.push(`/app/notes?note=${result.id}`);
      break;
    case 'idea':
      router.push(`/app/ideas?idea=${result.id}`);
      break;
    case 'tool':
      router.push(result.url); // 如 /app/tools?tab=json
      break;
  }
};
```

#### 5. 技术决策

**搜索策略选择**: 分别调用现有API，而非创建统一端点
- **理由**: 更简单，利用现有功能，减少开发工作量
- **笔记搜索**: 已有完整实现，直接调用 `/api/notes?search=`
- **灵感搜索**: 扩展现有API，添加 `search` 参数
- **工具搜索**: 本地搜索，无需API调用

**快捷键实现**: 使用 `@vueuse/core` 的 `useMagicKeys`
- **优势**: 跨平台兼容（Cmd/Ctrl自动处理）
- **监听**: 组合键监听，无需手动处理键盘事件
- **响应**: 即时响应，无延迟

**UI组件选择**: 使用现有 Sheet 组件
- **一致性**: 与现有UI风格保持一致
- **可访问性**: 支持键盘导航、屏幕阅读器
- **响应式**: 移动端适配良好

#### 6. 性能考虑

**防抖搜索**: 300ms防抖，减少API调用频率
**并行请求**: 同时搜索笔记和灵感，减少等待时间
**本地缓存**: 工具列表硬编码，无需网络请求
**结果限制**: 未限制结果数量，但API端有默认限制

#### 7. 用户体验优化

**自动聚焦**: 打开搜索面板时自动聚焦输入框
**文本选中**: 聚焦时自动选中现有文本，方便重新输入
**清空按钮**: 输入框右侧显示清空按钮
**加载状态**: 搜索时显示加载指示器
**空状态**: 无结果时显示友好提示
**选中高亮**: 键盘导航时高亮显示当前选中项
**鼠标交互**: 鼠标悬停时自动选中对应结果

#### 8. 文件清单

**新增文件** (6个):
- `packages/web/src/stores/search.ts`
- `packages/web/src/components/search/QuickSearch.vue`
- `packages/web/src/components/search/SearchInput.vue`
- `packages/web/src/components/search/SearchResults.vue`
- `packages/web/src/components/search/SearchResultItem.vue`
- `packages/web/src/components/search/index.ts`

**修改文件** (3个):
- `packages/server/src/routes/ideas.ts`
- `packages/web/src/api/ideas.ts`
- `packages/web/src/App.vue`

#### 9. 测试验证

**编译检查**:
- ✅ TypeScript编译通过（`vue-tsc --noEmit`）
- ✅ 无语法错误，类型安全

**运行时测试待进行**:
1. 启动开发服务器 (`pnpm dev`)
2. 测试快捷键响应 (Cmd/Ctrl+K)
3. 测试搜索功能 (笔记、灵感、工具)
4. 测试键盘导航 (↑↓, Enter, Escape)
5. 测试路由跳转 (选择结果后)
6. 测试移动端适配

#### 10. 已知限制

**搜索范围**:
- 笔记: 标题和内容
- 灵感: 标题和内容
- 工具: 名称和描述

**搜索性能**:
- 依赖后端数据库搜索性能
- 未实现结果分页（当前数据量小，无需分页）

**功能扩展**:
- 未实现搜索历史
- 未实现热门搜索
- 未实现搜索建议

### 总结
快速搜索面板功能已完整实现，具备所有核心功能：全局快捷键、实时搜索、键盘导航、分类显示、智能跳转。代码已就绪，等待运行时测试验证。
