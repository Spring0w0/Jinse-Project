# Jinse 项目部署指南

## 项目概述

锦瑟（Jinse）— AI 古诗词沉浸式学习平台，专注李商隐诗歌。技术栈：Vue 3 + Flask + PostgreSQL 16 + Caddy。

## 服务器要求

- **配置**: 2核4G 及以上
- **系统**: Ubuntu 22.04 / 24.04（推荐）、Rocky Linux 9
- **端口**: 80 (HTTP)、443 (HTTPS)、22 (SSH)
- **域名**: 一个已备案的域名，A 记录指向服务器 IP

---

## 一、服务器初始化

### 1.1 安装 Docker

**Ubuntu 22.04/24.04**:

```bash
sudo apt update && sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker --now
sudo usermod -aG docker $USER
```

退出 SSH 重新登录使 docker 组生效。

**验证**:
```bash
docker --version
docker compose version
```

### 1.2 配置 Docker 镜像加速

创建 `/etc/docker/daemon.json`:

```json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

重启 Docker:
```bash
sudo systemctl restart docker
docker info | grep -A 5 "Registry Mirrors"
```

> **备选**: 如有阿里云账号，可在容器镜像服务控制台获取专属加速地址 `https://<your-id>.mirror.aliyuncs.com`，替换上面的社区镜像。

### 1.3 防火墙配置

**云安全组**（在云控制台操作）: 放行入方向 TCP 80、443、22。

**系统防火墙**:

Ubuntu:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

Rocky/CentOS:
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 1.4 DNS 配置

在域名 DNS 管理后台添加 A 记录，指向服务器公网 IP。等待 5-30 分钟生效后验证:

```bash
dig +short your-domain.com
```

---

## 二、部署项目

### 2.1 上传代码

```bash
# 创建目录
sudo mkdir -p /opt/jinse
sudo chown $USER:$USER /opt/jinse

# 上传（选一种方式）
# 方式A: git clone
git clone https://github.com/your-username/Jinse-Project.git /opt/jinse

# 方式B: rsync
rsync -avz --exclude='.git' --exclude='.venv' --exclude='node_modules' \
  ./Jinse-Project/ user@server-ip:/opt/jinse/
```

### 2.2 配置环境变量

```bash
cd /opt/jinse
cp .env.deploy.example .env
chmod 600 .env
nano .env
```

**必须修改的值**:

| 变量 | 说明 |
|------|------|
| `SITE_DOMAIN` | 你的实际域名 |
| `OPENAI_API_KEY` | API 密钥 |
| `POSTGRES_PASSWORD` | 生成强密码: `openssl rand -base64 24` |
| `JINSE_CORS_ORIGIN` | 生产环境建议改为 `https://你的域名` |

### 2.3 构建镜像

```bash
docker compose build --no-cache
```

预计首次构建 3-8 分钟（npm install 最耗时）。如遇拉取镜像失败，检查镜像加速是否生效。

### 2.4 启动服务

```bash
docker compose up -d
```

### 2.5 观察启动日志

```bash
docker compose logs -f
```

正常流程会依次看到:
1. `[entrypoint] Waiting for PostgreSQL...`
2. `[entrypoint] PostgreSQL is ready.`
3. `[entrypoint] Applying database migrations...`
4. `[entrypoint] Database is empty. Running data import...`
5. `[entrypoint] Data import completed.`
6. `[entrypoint] Starting Gunicorn...`
7. Caddy: `serving initial certificate`（等待约 30-90 秒）

---

## 三、验证部署

```bash
# 健康检查
curl -s https://你的域名/api/health

# 诗歌列表
curl -s https://你的域名/api/poems | python3 -m json.tool | head -20

# 容器状态
docker compose ps
```

浏览器打开 `https://你的域名`:
- 首页正常加载
- 诗歌赏析、声律、配图、图谱、测验各模块可用
- AI 对话功能正常
- HTTPS 证书有效（浏览器地址栏锁图标）

---

## 四、日常维护

### 4.1 数据库备份

**手动备份**:
```bash
bash scripts/backup-db.sh
```

**自动备份**（cron）:
```bash
crontab -e
# 添加:
0 3 * * * cd /opt/jinse && bash scripts/backup-db.sh /opt/jinse/backups >> /var/log/jinse-backup.log 2>&1
```

备份文件位于 `backups/` 目录，保留最近 7 份。

**恢复**:
```bash
docker compose stop backend
gunzip -c backups/jinse_backup_20260505_030000.sql.gz | \
  docker compose exec -T db psql -U jinse -d jinse
docker compose start backend
```

### 4.2 更新代码

```bash
cd /opt/jinse
git pull --ff-only origin main
docker compose up -d --build
docker compose logs -f backend
```

重启时 entrypoint 会自动运行迁移。已有数据不会被重复导入。

### 4.3 查看日志

```bash
# 所有服务
docker compose logs -f --tail=100

# 单服务
docker compose logs -f backend
docker compose logs -f caddy

# 近30分钟
docker compose logs --since 30m backend
```

### 4.4 磁盘清理

```bash
# 每月执行一次
docker system prune -f
docker system df
```

---

## 五、常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| 构建时拉取镜像超时 | Docker Hub 不可达 | 检查 `/etc/docker/daemon.json` 镜像加速 |
| Backend 健康检查失败 | 数据库未就绪或导入失败 | `docker compose logs backend` 查看 entrypoint 日志 |
| HTTPS 证书获取失败 | 端口 80 被拦截 | 检查云安全组，DNS 是否生效 |
| 前端加载但数据为空 | 数据导入未执行 | `docker compose exec db psql -U jinse -d jinse -c "SELECT COUNT(*) FROM poems;"` |
| AI 对话报错 | API Key 无效或网络不通 | 检查 `.env` 中 `OPENAI_API_KEY` |
| 证书过期不续签 | Caddy data 卷丢失 | 勿执行 `docker compose down -v`，它会删除证书 |

---

## 六、可选优化

- **异地备份**: 安装 `ossutil`（阿里云 OSS）或 `coscli`（腾讯云 COS），将备份同步到对象存储
- **健康监控**: 添加 cron job 定期 curl `/api/health`，失败时发告警
- **DNS Challenge**: 如端口 80 被封，用 `xcaddy` 构建带 DNS 插件的 Caddy 镜像
