# Jinse 项目部署指南

## 项目概述

锦瑟（Jinse）— AI 古诗词沉浸式学习平台。完全自包含部署，与服务器上其他 Web 服务**零耦合**。

## 部署架构

```
外网请求 :81
    │
    ▼
┌──────────┐      ┌──────────────┐      ┌────────────┐
│  Caddy   │ ───→ │   Backend    │ ───→ │ PostgreSQL │
│   :81    │      │   :5001      │      │   :5432    │
│ (容器)   │ ◄─── │ (容器)       │      │ (容器)     │
└──────────┘      └──────────────┘      └────────────┘
  静态文件             Flask + Gunicorn     数据存储
  (dist/)
```

- **Caddy**: 托管前端静态文件，反向代理 `/api/*` 到后端
- **Backend**: Flask 应用，Gunicorn 运行，启动时自动初始化数据库
- **DB**: PostgreSQL 16，数据通过 Docker volume 持久化

**与服务器其他服务的关系**: 互不影响。Jinse 只听 81 端口，你的博客继续用 80 端口。

---

## 服务器要求

- Docker + Docker Compose Plugin
- 磁盘空闲 2G 以上
- **不需要** Node.js（前端在 Docker 内编译）
- **不需要** 额外安装 Python/PostgreSQL

---

## 第一步、配置 Docker 镜像加速

如果还没配过（国内服务器必做）：

```bash
sudo nano /etc/docker/daemon.json
```

写入：

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

```bash
sudo systemctl restart docker
docker info | grep -A 5 "Registry Mirrors"
```

---

## 第二步、上传项目

```bash
sudo mkdir -p /opt/jinse
sudo chown $USER:$USER /opt/jinse

# git clone
git clone https://github.com/你的用户名/Jinse-Project.git /opt/jinse
cd /opt/jinse
```

## 第三步、配置环境变量

```bash
cp .env.deploy.example .env
chmod 600 .env
nano .env
```

**只需要改三行**：

```ini
OPENAI_API_KEY=sk-你的真实密钥
OPENAI_BASE_URL=            # 用 DeepSeek/Qwen 等才填
POSTGRES_PASSWORD=生成一个强密码
```

生成密码：
```bash
openssl rand -base64 24
```

> 不填 `OPENAI_API_KEY` 也可以——聊天功能会用本地模拟回复。

## 第四步、启动

```bash
docker compose build --no-cache
docker compose up -d
```

查看启动日志：
```bash
docker compose logs -f
```

正常会依次看到：
```
[entrypoint] Waiting for PostgreSQL...
[entrypoint] PostgreSQL is ready.
[entrypoint] Applying database migrations...
[entrypoint] Database is empty. Running data import...
Import completed: 14 poems prepared, 84 modules prepared.
[entrypoint] Data import completed.
[entrypoint] Starting Gunicorn...
```

## 第五步、验证

```bash
# API 健康检查
curl http://localhost:81/api/health
# → {"ok":true}

# 检查容器状态
docker compose ps
# 三个服务都应该是 running/healthy
```

浏览器打开 `http://你的服务器IP:81` 或 `http://你的域名:81`。

## 第六步、防火墙放行 81 端口

云安全组 + 系统防火墙都要放行：

```bash
# 系统防火墙
sudo ufw allow 81/tcp
```

云控制台安全组添加入方向规则：TCP 81。

---

## 日常操作

### 更新代码

```bash
cd /opt/jinse
git pull --ff-only origin main
docker compose up -d --build
```

### 数据库备份

```bash
bash scripts/backup-db.sh
```

### 查看日志

```bash
docker compose logs -f --tail=100
```

### 查看访问记录

```bash
docker compose logs caddy | grep -E '"GET|POST'
```

---

## 彻底卸载

```bash
cd /opt/jinse
docker compose down     # 停止并删除容器
docker volume rm jinse_postgres_data   # 删除数据库数据（谨慎！）
cd ~ && rm -rf /opt/jinse   # 删除项目文件
```

对服务器上其他服务**零影响**。

---

## 常见问题

| 现象 | 处理 |
|------|------|
| 构建拉取镜像超时 | 回第一步检查镜像加速 |
| `curl localhost:81` 无响应 | `docker compose ps` 看 caddy 是否 running |
| API 返回空数据 | `docker compose exec db psql -U jinse -d jinse -c "SELECT COUNT(*) FROM poems;"` |
| 81 端口外网访问不了 | 检查云安全组和 ufw |
| AI 对话不回复 | 检查 `.env` 中 `OPENAI_API_KEY`；空着就用本地模拟 |
| 容器重启后数据丢失 | 不要用 `docker compose down -v`；正常 `restart` 数据在 |
