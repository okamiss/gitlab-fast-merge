# Ubuntu 24.04 部署说明

本项目使用 Docker Compose 部署三个容器：

- `frontend`：Nginx 托管前端静态文件，并将 `/api` 转发到后端。
- `backend`：NestJS API，启动时自动执行 Prisma 数据库迁移。
- `postgres`：PostgreSQL 16，数据保存在 Docker volume 中。

## 1. 安装 Docker

登录 Ubuntu 24.04 服务器后执行：

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

## 2. 上传项目并配置环境变量

将仓库上传或克隆到服务器，例如 `/opt/gitlab-fast-merge`：

```bash
cd /opt/gitlab-fast-merge
cp .env.example .env
nano .env
```

必须修改：

```dotenv
POSTGRES_PASSWORD=数据库强密码
JWT_SECRET=至少32位随机字符串
FRONTEND_ORIGIN=http://你的服务器IP或域名
```

生成 JWT 密钥可以使用：

```bash
openssl rand -base64 48
```

## 3. 启动服务

```bash
sudo docker compose up -d --build
sudo docker compose ps
curl http://127.0.0.1/api/health
```

浏览器访问 `http://服务器IP`。首次注册后即可使用。

## 4. 更新版本

```bash
cd /opt/gitlab-fast-merge
git pull
sudo docker compose up -d --build
```

后端启动时自动执行 `prisma migrate deploy`。

## 5. 备份数据库

```bash
sudo docker compose exec -T postgres pg_dump -U gitlab_fast_merge gitlab_fast_merge > backup.sql
```

恢复前请先确认目标数据库允许覆盖，再执行：

```bash
cat backup.sql | sudo docker compose exec -T postgres psql -U gitlab_fast_merge gitlab_fast_merge
```

## 6. 域名与 HTTPS

当前 Compose 默认直接暴露 `80` 端口。生产环境建议在服务器上增加 Caddy 或宿主机 Nginx，绑定域名并申请 Let's Encrypt 证书，再反向代理到 `http://127.0.0.1:80`。

若服务器启用了 UFW：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
