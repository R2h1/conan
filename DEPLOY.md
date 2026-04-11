# Conan 平台部署指南

## 部署方式

### 方式一：GitHub Actions 自动部署（推荐）

推送到 `main` 分支时自动触发部署。

#### 1. 配置 GitHub Secrets

在 GitHub 仓库的 **Settings > Secrets and variables > Actions** 中添加以下 secrets：

| Secret | 说明 | 示例 |
|--------|------|------|
| `DEPLOY_HOST` | 远程服务器 IP 或域名 | `192.168.1.100` |
| `DEPLOY_USER` | SSH 用户名 | `root` |
| `DEPLOY_KEY` | SSH 私钥（用于部署） | 见下方生成步骤 |
| `DEPLOY_PATH_FRONTEND` | 前端部署路径 | `/var/www/conan/web` |
| `DEPLOY_PATH_BACKEND` | 后端部署路径 | `/var/www/conan/server` |

#### 2. 生成部署密钥

```bash
# 生成 SSH 密钥对
ssh-keygen -t ed25519 -C "github-conan-deploy" -f deploy-key

# 将公钥添加到服务器
ssh-copy-id -i deploy-key.pub <DEPLOY_USER>@<DEPLOY_HOST>

# 将私钥添加到 GitHub Secrets
cat deploy-key.pub | gh secret set DEPLOY_KEY
```

#### 3. 服务器环境配置

登录服务器后，在后端部署目录创建 `.env` 文件：

```bash
ssh <DEPLOY_USER>@<DEPLOY_HOST>
cd /var/www/conan/server

# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，设置 JWT_SECRET
nano .env
```

**.env 配置**：
```bash
# JWT 密钥（必须修改为随机生成的 32+ 字符字符串）
JWT_SECRET=your-random-32-char-secret-key-here

# 数据库路径
DATABASE_URL=file:./dev.db

# 服务器端口
PORT=3000
```

#### 4. 生成随机 JWT 密钥

```bash
# 方法 1: 使用 openssl
openssl rand -base64 32

# 方法 2: 使用 node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 方式二：手动部署

#### 前端部署

```bash
# 1. 构建前端
pnpm --filter web build

# 2. 将 dist 目录部署到 Web 服务器
# 可以使用 rsync、scp 或 FTP
rsync -avz packages/web/dist/ <user>@<host>:/path/to/web/root/
```

#### 后端部署

```bash
# 1. 构建后端
pnpm --filter server build

# 2. 同步文件到服务器
rsync -avz packages/server/dist/ <user>@<host>:/path/to/server/
rsync packages/server/package.json <user>@<host>:/path/to/server/
rsync packages/server/prisma/schema.prisma <user>@<host>:/path/to/server/prisma/

# 3. 在服务器上安装依赖并启动
ssh <user>@<host>
cd /path/to/server
pnpm install --prod
npx prisma generate
npx prisma db push
pm2 start dist/index.js --name conan-server
```

## 服务器要求

### 最低配置
- CPU: 1 核
- 内存：512MB
- 存储：1GB

### 推荐配置
- CPU: 2 核
- 内存：1GB
- 存储：5GB

### 预装软件
- Node.js 22+
- pnpm 8+
- PM2（用于进程管理）

```bash
# Ubuntu/Debian 安装
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm pm2
```

## 反向代理配置

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/conan/web;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 启用 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

## 数据库备份

SQLite 数据库文件位于 `packages/server/prisma/dev.db`。

```bash
# 备份数据库
cp /var/www/conan/server/prisma/dev.db /backup/dev.db.$(date +%Y%m%d)

# 恢复数据库
cp /backup/dev.db.20260411 /var/www/conan/server/prisma/dev.db
pm2 restart conan-server
```

## 日志查看

```bash
# PM2 日志
pm2 logs conan-server

# 查看最近 100 行
pm2 logs conan-server --lines 100
```

## 常见问题

### 1. 登录失败 "Invalid token"

检查 `.env` 中的 `JWT_SECRET` 是否正确，重启服务后需要清除浏览器 cookie。

### 2. 数据库锁定错误

确保只有一个 PM2 进程在运行：

```bash
pm2 list
pm2 delete conan-server
pm2 start dist/index.js --name conan-server
```

### 3. CORS 错误

检查后端日志，确保 CORS 配置正确。生产环境建议在 `.env` 中指定具体域名：

```bash
CORS_ORIGIN=https://your-domain.com
```
