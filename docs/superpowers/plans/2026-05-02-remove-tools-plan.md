# 移除工具功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完全移除Conan项目中的工具功能代码和相关依赖，保留路由但显示占位符页面

**Architecture:** 采用完全清理方法：1) 重写Tools.vue为简单占位符 2) 删除工具组件目录 3) 移除crypto-js依赖 4) 验证构建和功能

**Tech Stack:** Vue 3 + TypeScript, Vite, Pinia, Vue Router, pnpm

---

## 文件结构

### 需要修改的文件
- **重写**: `packages/web/src/views/Tools.vue` - 替换1089行复杂工具页面为20行占位符
- **删除**: `packages/web/src/components/tools/JsonFormatter.vue` - 唯一工具组件
- **删除目录**: `packages/web/src/components/tools/` - 工具组件目录
- **修改**: `packages/web/package.json` - 移除crypto-js依赖
- **自动更新**: `pnpm-lock.yaml` - 通过pnpm install更新

### 占位符页面设计
```vue
<template>
  <div class="container mx-auto py-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">工具</h1>
      <p class="text-muted-foreground mb-6">
        此功能已暂时移除，将在未来版本中重新设计。
      </p>
      <div class="inline-flex items-center justify-center rounded-lg border p-8">
        <p class="text-sm">占位符页面 - 工具功能暂不可用</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简单的占位符组件，不包含任何工具逻辑
</script>
```

### 依赖变更
```json
// 从 packages/web/package.json 移除
"crypto-js": "^4.2.0"
```

---

### Task 1: 备份当前Tools.vue文件

**Files:**
- Create: `packages/web/src/views/Tools.backup.vue`
- Read: `packages/web/src/views/Tools.vue`

- [ ] **Step 1: 创建备份文件**

```bash
cp packages/web/src/views/Tools.vue packages/web/src/views/Tools.backup.vue
```

- [ ] **Step 2: 验证备份文件存在**

```bash
ls -la packages/web/src/views/Tools.backup.vue
```

预期输出：显示文件大小为约40KB（1089行代码）

- [ ] **Step 3: 检查备份文件内容**

```bash
head -20 packages/web/src/views/Tools.backup.vue
```

预期输出：显示Vue模板开头部分

- [ ] **Step 4: 提交备份文件**

```bash
git add packages/web/src/views/Tools.backup.vue
git commit -m "chore: backup original Tools.vue before removal"
```

---

### Task 2: 重写Tools.vue为占位符页面

**Files:**
- Modify: `packages/web/src/views/Tools.vue` - 完全重写

- [ ] **Step 1: 删除原Tools.vue文件**

```bash
rm packages/web/src/views/Tools.vue
```

- [ ] **Step 2: 创建新的占位符Tools.vue**

```vue
<template>
  <div class="container mx-auto py-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">工具</h1>
      <p class="text-muted-foreground mb-6">
        此功能已暂时移除，将在未来版本中重新设计。
      </p>
      <div class="inline-flex items-center justify-center rounded-lg border p-8">
        <p class="text-sm">占位符页面 - 工具功能暂不可用</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简单的占位符组件，不包含任何工具逻辑
</script>
```

保存到 `packages/web/src/views/Tools.vue`

- [ ] **Step 3: 验证新文件大小**

```bash
wc -l packages/web/src/views/Tools.vue
```

预期输出：约20行（原文件1089行）

- [ ] **Step 4: 检查文件语法**

```bash
cd packages/web
npx vue-tsc --noEmit src/views/Tools.vue
```

预期输出：无错误

- [ ] **Step 5: 提交新Tools.vue**

```bash
git add packages/web/src/views/Tools.vue
git commit -m "feat: replace tools page with placeholder"
```

---

### Task 3: 删除工具组件目录

**Files:**
- Delete: `packages/web/src/components/tools/JsonFormatter.vue`
- Delete: `packages/web/src/components/tools/` (目录)

- [ ] **Step 1: 检查工具组件目录内容**

```bash
ls -la packages/web/src/components/tools/
```

预期输出：显示 `JsonFormatter.vue` 文件

- [ ] **Step 2: 检查是否有其他工具相关文件引用**

```bash
grep -r "JsonFormatter" packages/web/src/ --include="*.vue" --include="*.ts" --include="*.js"
```

预期输出：无匹配（应已从Tools.vue中移除）

- [ ] **Step 3: 删除工具组件文件**

```bash
rm packages/web/src/components/tools/JsonFormatter.vue
```

- [ ] **Step 4: 删除工具组件目录**

```bash
rmdir packages/web/src/components/tools/
```

- [ ] **Step 5: 验证目录已删除**

```bash
ls -la packages/web/src/components/ | grep tools
```

预期输出：无输出（目录不存在）

- [ ] **Step 6: 提交删除操作**

```bash
git add packages/web/src/components/tools/
git commit -m "chore: remove tools component directory"
```

---

### Task 4: 从package.json移除crypto-js依赖

**Files:**
- Modify: `packages/web/package.json:17` (dependencies中的crypto-js)

- [ ] **Step 1: 查看当前package.json中的crypto-js**

```bash
grep -n "crypto-js" packages/web/package.json
```

预期输出：显示行号和内容：`"crypto-js": "^4.2.0"`

- [ ] **Step 2: 编辑package.json移除crypto-js**

当前package.json的dependencies部分：

```json
"dependencies": {
  "@vueuse/core": "^14.2.1",
  "axios": "^1.14.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "crypto-js": "^4.2.0",
  "echarts": "5.4.3",
  "highlight.js": "^11.11.1",
  "lucide-vue-next": "^1.0.0",
  "marked": "^17.0.5",
  "pinia": "^3.0.4",
  "reka-ui": "^2.9.2",
  "tailwind-merge": "^3.5.0",
  "tailwindcss-animate": "^1.0.7",
  "vue": "^3.5.30",
  "vue-echarts": "6.6.0",
  "vue-router": "4"
}
```

移除crypto-js行后：

```json
"dependencies": {
  "@vueuse/core": "^14.2.1",
  "axios": "^1.14.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "echarts": "5.4.3",
  "highlight.js": "^11.11.1",
  "lucide-vue-next": "^1.0.0",
  "marked": "^17.0.5",
  "pinia": "^3.0.4",
  "reka-ui": "^2.9.2",
  "tailwind-merge": "^3.5.0",
  "tailwindcss-animate": "^1.0.7",
  "vue": "^3.5.30",
  "vue-echarts": "6.6.0",
  "vue-router": "4"
}
```

- [ ] **Step 3: 验证crypto-js已移除**

```bash
grep "crypto-js" packages/web/package.json
```

预期输出：无匹配

- [ ] **Step 4: 检查是否有@types/crypto-js开发依赖**

```bash
grep -n "@types/crypto-js" packages/web/package.json
```

预期输出：显示行号和内容：`"@types/crypto-js": "^4.2.2"`

- [ ] **Step 5: 移除@types/crypto-js开发依赖**

从devDependencies中移除该行：

```json
"devDependencies": {
  "@types/crypto-js": "^4.2.2",
  "@types/marked": "^6.0.0",
  "@types/node": "^24.12.0",
  "@vitejs/plugin-vue": "^6.0.5",
  "@vue/tsconfig": "^0.9.0",
  "autoprefixer": "^10.4.27",
  "postcss": "^8.5.8",
  "tailwindcss": "^3",
  "typescript": "~5.9.3",
  "vite": "^8.0.1",
  "vue-tsc": "^3.2.5"
}
```

移除后：

```json
"devDependencies": {
  "@types/marked": "^6.0.0",
  "@types/node": "^24.12.0",
  "@vitejs/plugin-vue": "^6.0.5",
  "@vue/tsconfig": "^0.9.0",
  "autoprefixer": "^10.4.27",
  "postcss": "^8.5.8",
  "tailwindcss": "^3",
  "typescript": "~5.9.3",
  "vite": "^8.0.1",
  "vue-tsc": "^3.2.5"
}
```

- [ ] **Step 6: 提交package.json更改**

```bash
git add packages/web/package.json
git commit -m "chore: remove crypto-js dependencies"
```

---

### Task 5: 更新依赖锁文件

**Files:**
- Modify: `pnpm-lock.yaml` (自动更新)

- [ ] **Step 1: 运行pnpm install更新依赖**

```bash
cd packages/web
pnpm install
```

预期输出：显示更新进度，无错误

- [ ] **Step 2: 验证crypto-js已从node_modules移除**

```bash
ls -la node_modules/.pnpm/ | grep crypto-js
```

预期输出：无输出（目录不存在）

- [ ] **Step 3: 验证锁文件已更新**

```bash
grep -c "crypto-js" pnpm-lock.yaml
```

预期输出：0（无匹配）

- [ ] **Step 4: 提交锁文件更新**

```bash
git add pnpm-lock.yaml
git commit -m "chore: update lockfile after removing crypto-js"
```

---

### Task 6: 验证开发构建

**Files:**
- Test: 整个web包构建

- [ ] **Step 1: 运行TypeScript类型检查**

```bash
cd packages/web
npx vue-tsc -b --noEmit
```

预期输出：无错误

- [ ] **Step 2: 运行Vite开发构建（不启动服务器）**

```bash
npx vite build --mode development
```

预期输出：构建成功，显示完成信息

- [ ] **Step 3: 检查构建产物中的工具相关代码**

```bash
grep -r "crypto-js" dist/ || echo "No crypto-js found in build"
grep -r "JsonFormatter" dist/ || echo "No JsonFormatter found in build"
grep -r "formatJson" dist/ || echo "No tool functions found in build"
```

预期输出：都显示"No ... found in build"

- [ ] **Step 4: 提交构建验证**

```bash
git add -A
git commit -m "test: verify build after tools removal"
```

---

### Task 7: 验证生产构建

**Files:**
- Test: 生产构建

- [ ] **Step 1: 运行生产构建**

```bash
cd packages/web
npx vite build
```

预期输出：构建成功，显示完成信息和文件大小

- [ ] **Step 2: 比较构建前后大小变化**

```bash
du -sh dist/
```

记录输出：构建产物大小（预期比之前小，因为移除了crypto-js）

- [ ] **Step 3: 启动预览服务器测试**

```bash
npx vite preview --port 4173 &
sleep 3
curl -s http://localhost:4173/app/tools | grep -o "工具功能暂不可用" || echo "Page content not found"
pkill -f "vite preview"
```

预期输出："工具功能暂不可用"

- [ ] **Step 4: 提交生产构建验证**

```bash
git add -A
git commit -m "test: verify production build"
```

---

### Task 8: 验证路由功能

**Files:**
- Test: 路由配置和页面访问

- [ ] **Step 1: 检查路由配置**

```bash
grep -n "tools" packages/web/src/router/index.ts
```

预期输出：显示包含"tools"的路由配置行

- [ ] **Step 2: 启动开发服务器测试**

```bash
cd packages/web
pnpm dev &
DEV_PID=$!
sleep 5
```

- [ ] **Step 3: 测试工具页面访问**

```bash
curl -s http://localhost:5173/app/tools | grep -o "工具功能暂不可用" || echo "Test failed"
```

预期输出："工具功能暂不可用"

- [ ] **Step 4: 停止开发服务器**

```bash
kill $DEV_PID
```

- [ ] **Step 5: 提交路由验证**

```bash
git add -A
git commit -m "test: verify tools route functionality"
```

---

### Task 9: 最终清理和文档更新

**Files:**
- Modify: `CLAUDE.md` (如果提到工具功能)
- Remove: `packages/web/src/views/Tools.backup.vue` (可选)

- [ ] **Step 1: 检查CLAUDE.md中是否提到工具功能**

```bash
grep -n -i "tool" CLAUDE.md
```

预期输出：可能显示工具相关的描述

- [ ] **Step 2: 更新CLAUDE.md中的工具描述**

如果CLAUDE.md中有工具相关描述，更新为：
```markdown
### 工具功能
- 工具功能已暂时移除，将在未来版本中重新设计
- `/app/tools` 路由保留但显示占位符页面
```

- [ ] **Step 3: 可选：删除备份文件**

```bash
rm packages/web/src/views/Tools.backup.vue
git add packages/web/src/views/Tools.backup.vue
```

- [ ] **Step 4: 运行最终构建验证**

```bash
cd packages/web
pnpm build
```

预期输出：构建成功

- [ ] **Step 5: 提交最终更改**

```bash
git add -A
git commit -m "chore: final cleanup after tools removal"
```

---

### Task 10: 验证成功标准

**验证步骤:**

- [ ] **Step 1: 验证 /app/tools 页面可访问**

```bash
cd packages/web
pnpm dev &
sleep 5
curl -s http://localhost:5173/app/tools | grep -q "工具功能暂不可用" && echo "✓ Page accessible" || echo "✗ Page test failed"
pkill -f "vite"
```

- [ ] **Step 2: 验证生产构建成功**

```bash
cd packages/web
pnpm build && echo "✓ Build successful" || echo "✗ Build failed"
```

- [ ] **Step 3: 验证 crypto-js 完全移除**

```bash
cd packages/web
! grep -q "crypto-js" package.json && echo "✓ Removed from package.json" || echo "✗ Still in package.json"
! ls node_modules/.pnpm/ | grep -q crypto-js && echo "✓ Removed from node_modules" || echo "✗ Still in node_modules"
```

- [ ] **Step 4: 验证其他功能正常工作**

```bash
cd packages/web
pnpm dev &
sleep 5
# 测试登录页面可访问
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/login | grep -q "200" && echo "✓ Login page accessible" || echo "✗ Login page test failed"
pkill -f "vite"
```

- [ ] **Step 5: 验证代码库中无工具相关代码残留**

```bash
cd packages/web
! grep -r "crypto-js" src/ && echo "✓ No crypto-js imports" || echo "✗ crypto-js imports found"
! grep -r "JsonFormatter" src/ && echo "✓ No JsonFormatter references" || echo "✗ JsonFormatter references found"
! grep -r "CryptoJS" src/ && echo "✓ No CryptoJS references" || echo "✗ CryptoJS references found"
```

- [ ] **Step 6: 验证类型检查通过**

```bash
cd packages/web
npx vue-tsc -b --noEmit && echo "✓ Type check passed" || echo "✗ Type check failed"
```

---

## 成功标准检查清单

完成所有任务后验证：

1. ✅ `/app/tools` 页面可访问并显示占位符内容
2. ✅ 生产构建成功完成，无错误或警告  
3. ✅ `crypto-js` 依赖完全从项目中移除
4. ✅ 应用其他功能（登录、笔记等）正常工作
5. ✅ 代码库中无工具相关代码残留
6. ✅ 类型检查通过，无 TypeScript 错误

---

**计划完成时间**: 预计30-45分钟
**风险评估**: 低（保留路由，仅替换页面内容）
**回滚方案**: 恢复 `Tools.backup.vue` 和重新添加 `crypto-js` 依赖