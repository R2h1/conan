# 打卡排名App设计规范

## 背景
在现有Conan个人数字平台基础上，开发独立的打卡排名应用，旨在通过排名机制激励用户坚持打卡习惯。该应用将复用现有后端（Fastify + Prisma + SQLite），但创建全新的前端包，专注于排名和社交竞争功能。

## MVP范围
核心功能：个人连续打卡天数排行榜
- 计算所有用户的当前连续打卡天数
- 按连续天数降序排列的全局排行榜
- 个人排名位置和历史数据展示
- 定期更新的排名缓存机制

## 技术架构

### 后端扩展（现有包内新增）
1. **排名API端点**：`/api/ranking/*`
   - `GET /api/ranking/streak` - 获取连续打卡排行榜
   - `GET /api/ranking/user/:userId` - 获取用户详细排名数据
   - `GET /api/ranking/stats` - 获取排名系统统计信息

2. **排名计算服务**
   - 基于现有CheckinSummary表计算用户连续打卡天数
   - 定期（每30分钟）预计算并缓存排名结果
   - 支持实时计算，但性能优化后使用缓存

3. **数据模型扩展**
   ```prisma
   model RankingCache {
     id        Int      @id @default(autoincrement())
     type      String   // "streak_daily", "streak_weekly", "streak_monthly"
     date      DateTime // 缓存生成日期
     data      String   // JSON格式的排名数据
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     
     @@unique([type, date])
     @@index([type, date])
   }
   
   model UserRankingStats {
     id              Int      @id @default(autoincrement())
     userId          Int      @unique
     user            User     @relation(fields: [userId], references: [id])
     currentStreak   Int      @default(0)     // 当前连续打卡天数
     maxStreak       Int      @default(0)     // 历史最高连续打卡天数
     totalCheckins   Int      @default(0)     // 总打卡天数
     lastCheckinDate DateTime?                // 最后打卡日期
     rank            Int?                     // 当前排名
     rankChange      Int?     @default(0)     // 排名变化（+/-）
     updatedAt       DateTime @updatedAt
     
     @@index([currentStreak])
     @@index([rank])
   }
   ```

### 前端新包（packages/ranking-app）
1. **技术栈**：Vue 3 + TypeScript + Vite + Pinia + Vue Router
2. **项目结构**：
   ```
   packages/ranking-app/
   ├── src/
   │   ├── api/           # API客户端
   │   ├── components/    # 可复用组件
   │   │   ├── ranking/
   │   │   │   ├── RankingTable.vue     # 排行榜表格
   │   │   │   ├── UserRankCard.vue     # 用户排名卡片
   │   │   │   ├── StreakProgress.vue   # 连续打卡进度
   │   │   │   └── BadgeDisplay.vue     # 徽章展示
   │   │   └── ui/        # 基础UI组件
   │   ├── views/         # 页面组件
   │   │   ├── Home.vue                  # 首页/排行榜主页面
   │   │   ├── UserProfile.vue           # 用户详情页面
   │   │   ├── Achievement.vue           # 成就页面
   │   │   └── Settings.vue              # 设置页面
   │   ├── stores/        # Pinia状态管理
   │   │   └── ranking.ts
   │   ├── router/        # 路由配置
   │   └── main.ts        # 应用入口
   ├── index.html
   ├── package.json
   └── vite.config.ts
   ```

3. **主要页面设计**：
   - **排行榜首页**：显示全局连续打卡排行榜，支持分页和筛选
   - **个人面板**：显示用户当前排名、连续打卡天数、历史最高记录等
   - **成就系统**：展示可解锁的徽章和成就（MVP后扩展）

## 数据流设计

### 排名计算流程
1. **每日计算**：定时任务扫描CheckinSummary表，计算每个用户的连续打卡天数
2. **排名更新**：根据计算结果更新UserRankingStats表
3. **缓存生成**：生成RankingCache供前端快速查询
4. **实时更新**：用户打卡时触发增量更新

### API响应格式
```typescript
// GET /api/ranking/streak
{
  "type": "current_streak",
  "period": "daily", // daily, weekly, monthly
  "generatedAt": "2026-04-25T10:30:00Z",
  "totalUsers": 150,
  "rankings": [
    {
      "rank": 1,
      "userId": 123,
      "userName": "用户A",
      "currentStreak": 45,
      "maxStreak": 60,
      "totalCheckins": 120,
      "avatarUrl": "...",
      "rankChange": 0
    },
    // ...
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalPages": 3
  }
}
```

## 性能考虑

1. **缓存策略**：排名数据每30分钟更新一次，避免实时计算开销
2. **分页加载**：排行榜支持分页，避免一次性加载大量数据
3. **增量更新**：用户打卡时只更新相关用户的排名，而非全量重算
4. **数据库索引**：为UserRankingStats表的currentStreak和rank字段创建索引

## 安全与隐私

1. **匿名化选项**：用户可选择在排行榜中显示昵称或保持匿名
2. **数据最小化**：只公开必要的排名信息，不暴露详细打卡记录
3. **权限控制**：排名API需要认证，但部分数据可公开访问

## MVP交付物

### 阶段1：后端API开发（2-3天）
- 排名计算算法实现
- UserRankingStats模型和API
- 定时任务和缓存机制

### 阶段2：前端基础框架（2天）
- 新包初始化（Vue 3 + TypeScript）
- 路由和基础布局
- API客户端集成

### 阶段3：排行榜核心功能（3-4天）
- 排行榜表格组件
- 用户排名卡片
- 分页和筛选功能
- 个人数据展示

### 阶段4：优化和测试（2天）
- 性能优化
- 响应式设计
- 基础测试
- 文档编写

## 扩展规划

### 阶段2（MVP后）
1. 好友排行榜：添加好友，查看好友间的排名
2. 团队竞赛：创建团队，团队成员共同打卡竞争
3. 分类排名：财务、运动、学习各分类的独立排名

### 阶段3
1. 成就系统：解锁徽章和成就
2. 挑战活动：限时打卡挑战
3. 社交分享：分享排名和成就到社交平台

### 阶段4
1. 移动端优化：PWA支持
2. 实时通知：排名变化提醒
3. 数据分析：个人打卡习惯分析

## 成功指标
- 用户每日查看排行榜的平均次数
- 用户连续打卡天数的平均增长
- 新用户注册转化率（通过排名功能吸引）
- 用户留存率（排名功能的贡献）

## 风险与缓解
1. **性能风险**：大量用户时排名计算可能慢
   - 缓解：实现缓存和增量更新
2. **数据隐私**：用户可能不希望公开打卡数据
   - 缓解：提供匿名选项和隐私设置
3. **用户作弊**：虚假打卡获取高排名
   - 缓解：添加反作弊机制和人工审核
4. **社交压力**：排名可能造成用户压力
   - 缓解：设计鼓励而非竞争的氛围，提供个人成长视角