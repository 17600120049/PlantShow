# 流浪植物中转站 (Plant Wander)

微信小程序 + NestJS 后端 + React 管理后台，支持扫码送养、扫码领养、中转站管理与二维码生成。

## 功能概览

- **微信小程序**：首页浏览中转站与待领养植物、扫码送养 / 领养、收藏、个人中心
- **后端 API**：中转站与植物 CRUD、送养 / 领养流程、积分、JWT 鉴权、二维码 PNG 生成
- **管理后台**：仪表盘、用户 / 中转站 / 植物管理（Ant Design）
- **Docker 部署**：一键拉起 MySQL + 后端 + Nginx（含管理后台静态资源）

## 技术栈

| 模块 | 技术 |
|------|------|
| 小程序 | 微信原生小程序 |
| 后端 | NestJS 10、Prisma 5、MySQL 8、JWT |
| 管理后台 | React 18、Vite 5、Ant Design 5 |
| 部署 | Docker Compose、Nginx |

## 项目结构

```
├── frontend/           # 微信小程序
├── backend/            # NestJS API + Prisma
├── admin-frontend/     # React 管理后台
├── nginx/              # Nginx 配置与多阶段构建 Dockerfile
├── docker-compose.yml
└── package.json        # Monorepo 根脚本（workspaces）
```

## 环境要求

- **Docker 部署**：Docker Desktop / Docker Engine + Docker Compose v2
- **本地开发**：Node.js 18+、MySQL 8（或使用 Docker 仅启动 MySQL）

---

## Docker 一键部署（推荐）

```bash
# 克隆后进入项目根目录
npm run docker:deploy
```

该命令会构建并启动三个服务：

| 服务 | 容器名 | 端口 | 说明 |
|------|--------|------|------|
| MySQL | plant-wander-mysql | 3306 | 数据库，库名 `plant_wander` |
| Backend | plant-wander-backend | 3000 | NestJS API，启动时自动迁移 + 种子数据 |
| Nginx | plant-wander-nginx | 80 | 反代 `/api`，托管 `/admin` |

### 访问地址

| 入口 | URL |
|------|-----|
| API | http://localhost/api/stations |
| API（直连后端） | http://localhost:3000/api/stations |
| 管理后台 | http://localhost/admin/ |

### 默认账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | `admin` | `admin123` |

种子数据还会创建演示用户、3 个中转站、4 株待领养植物。

### 常用命令

```bash
npm run docker:logs    # 查看所有服务日志
npm run docker:down    # 停止并移除容器（数据卷保留）
```

重新部署（代码更新后）：

```bash
npm run docker:deploy
```

> **生产环境**：请修改 `docker-compose.yml` 中的 `MYSQL_ROOT_PASSWORD`、`JWT_SECRET`、`ADMIN_JWT_SECRET` 等默认值。

---

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

复制环境变量模板并编辑：

```bash
cp backend/.env.example backend/.env
```

默认连接本地 MySQL：

```
DATABASE_URL="mysql://root:plant123@localhost:3306/plant_wander"
```

初始化数据库：

```bash
cd backend
npx prisma migrate dev
npm run prisma:seed
```

### 3. 启动后端

```bash
npm run backend:dev
```

API 地址：http://localhost:3000/api

### 4. 启动管理后台

```bash
npm run admin:dev
```

开发地址：http://localhost:3002/admin/

### 5. 微信小程序

1. 使用 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 打开 `frontend/` 目录
2. 在 `frontend/app.js` 中确认 `globalData.apiBaseUrl` 指向后端：

   ```js
   apiBaseUrl: 'http://localhost:3000/api'
   ```

3. 开发阶段在开发者工具中勾选 **不校验合法域名**

---

## API 概览

所有接口前缀为 `/api`。

### 小程序 / 公开

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/dev-login` | 开发环境登录（openid + nickname） |
| GET | `/stations` | 中转站列表（`?activeOnly=1` 仅营业中） |
| GET | `/stations/:id` | 中转站详情 |
| GET | `/stations/:id/plants` | 中转站待领养植物 |
| GET | `/plants` | 全部待领养植物 |
| GET | `/plants/code/:plantCode` | 按编号查询植物 |
| GET | `/plants/:id` | 植物详情 |
| POST | `/plants/donate` | 送养（需 JWT） |
| POST | `/plants/:id/adopt` | 领养（需 JWT） |
| GET | `/users/me` | 当前用户（需 JWT） |
| GET | `/users/me/stats` | 用户统计（需 JWT） |
| GET | `/qr/plant/:plantCode` | 植物二维码 PNG（`?format=json` 返回 JSON） |
| GET | `/qr/station/:id` | 中转站二维码 PNG |

### 管理后台（需 Admin JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/admin/login` | 管理员登录 |
| GET | `/admin/dashboard` | 仪表盘统计 |
| GET/PATCH/DELETE | `/admin/users` … | 用户管理 |
| POST | `/admin/users/:id/points` | 调整积分 |
| GET/POST/PATCH/DELETE | `/admin/stations` … | 中转站管理 |
| GET/PATCH/DELETE | `/admin/plants` … | 植物管理 |

中转站 **营业状态** 根据 `hours` 字段（如 `09:00-20:00`）自动计算，无需手动开关。

---

## 二维码格式

小程序扫码解析支持以下协议：

```
plantwander://plant/PW-000001    # 植物编号
plantwander://station/1          # 中转站 ID
```

也可通过 API 获取 PNG 图片：

```
GET /api/qr/plant/PW-000001
GET /api/qr/station/1
```

---

## 环境变量

见 `backend/.env.example`：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | MySQL 连接串 |
| `JWT_SECRET` | 小程序用户 JWT 密钥 |
| `JWT_EXPIRES_IN` | 用户 Token 有效期 |
| `ADMIN_JWT_SECRET` | 管理员 JWT 密钥 |
| `ADMIN_JWT_EXPIRES_IN` | 管理员 Token 有效期 |
| `PORT` | 后端监听端口（默认 3000） |

---

## 根目录脚本

| 命令 | 说明 |
|------|------|
| `npm run backend:dev` | 启动后端开发模式 |
| `npm run backend:build` | 构建后端 |
| `npm run backend:seed` | 执行种子数据 |
| `npm run admin:dev` | 启动管理后台开发服务器 |
| `npm run admin:build` | 构建管理后台 |
| `npm run docker:deploy` | Docker 一键构建并启动 |
| `npm run docker:down` | 停止 Docker 服务 |
| `npm run docker:logs` | 查看 Docker 日志 |

---

## 许可证

Private — 仅供项目内部使用。
