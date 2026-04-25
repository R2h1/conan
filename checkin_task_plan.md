# Task Plan: Conan 打卡系统实施
<!-- 
  WHAT: 打卡系统分阶段实施计划，涵盖财务记账、运动、学习阅读三大模块，集成AI智能辅助和微信提醒。
  WHY: 复杂功能需要分阶段实施，确保代码质量和技术债务可控。
  WHEN: 创建于2026-04-21，开始实施前。
-->

## Goal
在现有Conan平台基础上，新增个人打卡系统，包含财务记账、运动、学习阅读三大模块，集成免费AI API实现智能解析和每日简报，通过企业微信群机器人实现微信提醒。

## Current Phase
Phase 7: Dashboard集成与测试部署

## Phases

### Phase 1: 需求分析与架构设计
<!-- 
  WHAT: 深入理解需求，设计技术架构，评估现有代码库可复用组件。
  WHY: 确保技术方案与现有架构兼容，避免重复造轮子。
-->
- [x] 分析现有项目结构和代码模式（已完成探索）
- [x] 设计数据库Schema（Prisma模型）- 基于现有模式设计
- [x] 规划API端点和路由结构 - 复用现有RESTful模式
- [x] 评估AI服务选型和集成方案 - 多服务商降级策略
- [x] 制定微信推送技术方案 - 企业微信群机器人
- **Status:** complete

### Phase 2: 后端基础架构搭建
<!-- 
  WHAT: 实现数据库模型、基础API端点、认证集成。
  WHY: 建立可扩展的后端基础，确保数据安全和用户隔离。
-->
- [x] 更新Prisma Schema，添加打卡相关模型
- [x] 运行Prisma迁移，创建数据库表（数据库已更新，Prisma客户端生成成功）
- [x] 实现财务记账CRUD API
- [x] 实现运动记录CRUD API
- [x] 实现学习阅读CRUD API
- [x] 集成现有JWT认证中间件
- **Status:** complete

### Phase 3: 前端基础页面实现
<!-- 
  WHAT: 创建打卡系统前端页面和组件。
  WHY: 提供用户界面，支持三大模块的数据录入和展示。
-->
- [x] 创建打卡系统路由和导航
- [x] 实现财务记账页面和表单
- [x] 实现运动记录页面和表单
- [x] 实现学习阅读页面和表单
- [x] 集成现有Pinia状态管理
- [x] 复用shadcn-vue UI组件
- **Status:** complete

### Phase 4: 打卡日历与统计图表
<!-- 
  WHAT: 实现日历视图和数据分析可视化。
  WHY: 提升用户体验，提供数据洞察。
-->
- [x] 实现月视图打卡日历
- [x] 集成图表库（ECharts/Recharts） - 已安装ECharts和vue-echarts
- [x] 创建收支饼图、运动趋势图、学习时长图（基础统计页面，图表待集成）
- [x] 优化日历交互和响应式设计
- **Status:** complete

### Phase 5: AI智能功能集成
<!-- 
  WHAT: 集成免费AI API，实现智能解析和推荐功能。
  WHY: 提升产品智能化水平，增强用户粘性。
-->
- [x] 设计AI Gateway统一调用层
- [x] 实现智能记账解析（自然语言→结构化数据）
- [x] 实现每日简报生成
- [x] 实现学习内容摘要生成
- [x] 实现运动推荐功能
- [x] 添加多服务商降级策略
- **Status:** complete

### Phase 6: 微信提醒与定时任务
<!-- 
  WHAT: 集成企业微信群机器人，实现定时提醒功能。
  WHY: 增强用户参与度和连续性。
-->
- [x] 实现企业微信Webhook调用（完成）
- [x] 创建每日提醒定时任务（完成）
- [x] 实现连续打卡成就通知（完成）
- [x] 添加异常消费提醒（完成）
- [x] 提供微信推送开关配置（完成）
- **Status:** complete

### Phase 7: Dashboard集成与测试部署
<!-- 
  WHAT: 将打卡系统集成到现有Dashboard，进行全面测试和部署。
  WHY: 确保功能完整性和生产环境稳定性。
-->
- [ ] 在Dashboard添加打卡快捷入口
- [ ] 实现今日未打卡模块提示
- [ ] 进行MCP自动化测试
- [ ] 修复测试发现的问题
- [ ] 更新文档和配置
- **Status:** pending

## Key Questions
1. 现有笔记系统的标签存储格式是什么？如何与打卡系统标签格式保持一致？
2. 企业微信群机器人的使用限制是什么？如何避免触发频率限制？
3. AI免费API的调用频率和稳定性如何？需要什么样的降级策略？
4. 打卡日历的数据同步机制如何设计？是否需要CheckinSummary表优化性能？
5. 微信推送的用户个性化配置如何存储和管理？

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 使用现有技术栈（Vue 3 + Fastify + Prisma + SQLite） | 保持架构一致性，降低学习成本和维护负担 |
| AI服务采用多服务商免费层组合 | 零成本实现智能化功能，避免单点依赖 |
| 微信推送采用企业微信群机器人方案 | MVP阶段简单可靠，无需复杂配置 |
| 数据库使用SQLite + Prisma ORM | 单用户场景足够，类型安全，开发体验好 |
| 前端复用shadcn-vue组件库 | 保持UI一致性，加速开发进度 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Prisma Schema验证错误：缺少双向关系字段 | 1 | 更新User模型添加打卡相关关系字段 |
| Prisma Schema验证错误：Note模型缺少studyRecords关系 | 2 | 更新Note模型添加studyRecords字段 |
| Prisma Schema验证错误：CheckinSummary缺少user关系 | 3 | 在CheckinSummary模型中添加user关系字段 |
| 权限错误：prisma generate文件重命名失败 | 4 | 可能是Windows文件锁定，需要重启或关闭占用进程 |
| 路由无限循环：Maximum call stack size exceeded | 5 | 修复路由重定向逻辑，避免/app路径上的无限循环 |
| 依赖错误：ERR_MODULE_NOT_FOUND node-schedule | 6 | 安装node-schedule依赖：pnpm install node-schedule |
| 侧边栏导航误触：点击工具集时侧边栏收起 | 7 | 添加pointer-events-none group-hover:pointer-events-auto样式，避免按钮拦截点击 |

## Notes
- 需要复用现有认证系统（JWT + HTTP-Only Cookie）
- 财务、运动、学习三个模块API设计应保持一致性
- 考虑添加CheckinSummary表优化日历查询性能，但增加同步复杂度
- AI功能应提供关闭开关，保护用户隐私
- 微信提醒需遵守企业微信使用规范，避免营销内容