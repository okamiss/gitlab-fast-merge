# GitLab Fast Merge

GitLab Fast Merge 是一个前后端分离的分支与发布工作台。它可以生成 Branch、Tag 和 Merge Request 链接，保存个人分支记录，并按月份展示趋势。

## 技术栈

- 前端：React、TypeScript、Vite、Ant Design、Recharts
- 后端：NestJS、Prisma、JWT、bcrypt
- 数据库：PostgreSQL
- 部署：Docker Compose、Nginx

## 本地运行

推荐在本机运行前后端开发服务，只使用 Docker 启动 PostgreSQL。

先在项目根目录创建 Docker Compose 环境变量，并启动数据库：

```bash
cp .env.example .env
docker compose up -d postgres
```

Windows PowerShell 使用：

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
```

编辑根目录 `.env`，至少替换 `POSTGRES_PASSWORD` 和 `JWT_SECRET`。然后复制后端环境变量：

```bash
cd backend
cp .env.example .env
```

Windows PowerShell 使用：

```powershell
cd backend
Copy-Item .env.example .env
```

编辑 `backend/.env`：

```dotenv
PORT=3000
DATABASE_URL=postgresql://gitlab_fast_merge:你在根目录设置的数据库密码@localhost:5432/gitlab_fast_merge?schema=public
JWT_SECRET=你在根目录设置的JWT密钥
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
```

初始化数据库并启动后端：

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

新开一个终端运行前端：

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`。前端开发服务器会将 `/api` 代理到 `http://localhost:3000`。

## 旧版数据迁移

用户首次登录后，浏览器中的旧版 `localStorage` 分支记录和设置会自动导入当前账号，并从旧存储位置移除。不同用户的数据由后端按 JWT 身份隔离。

## 部署

Ubuntu 24.04 部署步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。
