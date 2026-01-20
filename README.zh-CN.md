# V-Waitlist

[English](./README.md)

<div align="center">

> 面向独立开发者的开源、无服务器病毒式等待名单系统

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/iannil/v-waitlist&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,ADMIN_SECRET_KEY&project-name=v-waitlist&repository-name=v-waitlist)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/iannil/v-waitlist)

</div>

---

## 什么是 V-Waitlist？

**V-Waitlist** 是 Viral Loops 等付费服务的零成本替代方案。构建带有推荐系统、排行榜和社交分享的病毒式等待名单。

- **$0/月** - 使用 Vercel + Upstash Redis 的免费版
- **3 行代码集成** - 放入 `<v-waitlist>` 即可
- **极致性能** - Edge Functions + Redis，响应 <100ms
- **数据自主** - 存储在你自己的 Redis 实例中

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 🎯 **病毒式推荐** | 用户通过邀请他人提升排名 |
| 📊 **实时排名** | Redis 驱动，毫秒级响应 |
| 🛡️ **防刷保护** | Cloudflare Turnstile + 速率限制 + 邮箱过滤 |
| 📤 **数据导出** | 导出 CSV 用于邮件营销 |
| 🌙 **深色模式** | 内置亮色和深色主题 |
| 🎨 **可定制** | 通过属性自定义颜色 |
| ⚡ **Edge Runtime** | 全球分发，冷启动亚秒级 |

---

## 快速开始

### 1. 部署到 Vercel

点击上方的 "Deploy with Vercel" 按钮。你需要：

- 一个 [Upstash Redis](https://upstash.com) 账号（免费版即可）
- 你的 Redis REST URL 和 Token

### 2. 添加到你的网站

```html
<script src="https://your-app.vercel.app/sdk.js"></script>
<v-waitlist project-id="your-project-id"></v-waitlist>
```

### 3. 完成

你的等待名单现在已上线。用户可以注册并开始邀请他人。

---

## 配置选项

### 属性

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `project-id` | string | 是 | - | 你的项目唯一标识符 |
| `mode` | string | 否 | `input` | `input` 或 `modal` |
| `theme` | string | 否 | `light` | `light` 或 `dark` |
| `primary-color` | string | 否 | `#000000` | 主色调（十六进制） |
| `api-base-url` | string | 否 | (当前域名) | 自定义 API 基础 URL |

### 示例

```html
<v-waitlist
  project-id="my-product"
  mode="modal"
  theme="dark"
  primary-color="#6366f1"
></v-waitlist>
```

---

## 自托管

```bash
# 克隆仓库
git clone https://github.com/iannil/v-waitlist.git
cd v-waitlist

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example apps/api/.env.local
```

编辑 `apps/api/.env.local` 填入你的凭据：

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXX...
TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
ADMIN_SECRET_KEY=your-secret-key
```

```bash
# 运行开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

---

## 开发

```bash
# 安装依赖
pnpm install

# 运行 API 开发服务器 (http://localhost:3000)
pnpm --filter @v-waitlist/api dev

# 运行 SDK 开发服务器 (http://localhost:5173)
pnpm --filter @v-waitlist/sdk dev

# 运行 Web 开发服务器 (http://localhost:3001)
pnpm --filter @v-waitlist/web dev

# 运行所有开发服务器
pnpm dev

# 构建所有包
pnpm build

# 运行测试
pnpm test
```

---

## 项目结构

```
v-waitlist/
├── apps/
│   ├── api/              # Next.js API (Edge Runtime)
│   │   ├── app/api/
│   │   │   ├── join/     # POST /api/join
│   │   │   ├── status/   # GET /api/status
│   │   │   └── export/   # GET /api/export
│   │   └── lib/
│   │       ├── redis.ts
│   │       ├── redis-scripts.ts
│   │       ├── turnstile.ts
│   │       └── utils.ts
│   └── web/              # 落地页
├── packages/
│   └── sdk/              # 前端组件 (Preact + Vite)
│       └── dist/
│           └── v-waitlist.min.js  # 19KB (7.89KB gzipped)
├── docs/                 # 文档
├── LICENSE               # MIT 许可证
└── vercel.json           # 部署配置
```

---

## API 文档

### POST /api/join

注册新用户到等待名单。

**请求：**

```json
{
  "email": "user@example.com",
  "projectId": "my-project",
  "referrerCode": "abc12345",
  "turnstileToken": "0x..."
}
```

**响应：**

```json
{
  "success": true,
  "refCode": "def67890",
  "rank": 543,
  "total": 1002,
  "shareUrl": "?ref=def67890"
}
```

### GET /api/status

获取用户当前排名和统计信息。

**请求：**

```
GET /api/status?email=user@example.com&projectId=my-project
```

**响应：**

```json
{
  "success": true,
  "rank": 543,
  "total": 1002,
  "aheadOf": 459,
  "refCode": "abc12345",
  "referralCount": 3,
  "shareUrl": "?ref=abc12345"
}
```

### GET /api/export

导出所有用户为 CSV（需要管理员密钥）。

**请求：**

```
GET /api/export?projectId=my-project
Authorization: Bearer YOUR_ADMIN_SECRET_KEY
```

**响应：**

```
email,ref_code,referred_by,referral_count,created_at,rank
user1@example.com,abc12345,,5,2025-01-19T10:30:00Z,10
```

完整 API 文档请参阅 [`docs/02-api-design.md`](./docs/02-api-design.md)。

---

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `UPSTASH_REDIS_REST_URL` | 是 | Upstash Redis REST API URL |
| `UPSTASH_REDIS_REST_TOKEN` | 是 | Upstash Redis 认证令牌 |
| `TURNSTILE_SITE_KEY` | 否 | Cloudflare Turnstile Site Key |
| `TURNSTILE_SECRET_KEY` | 否 | Cloudflare Turnstile Secret Key |
| `ADMIN_SECRET_KEY` | 是 | `/api/export` 的管理密钥 |

---

## 文档

- [架构设计](./docs/01-architecture.md) - 系统设计和技术栈
- [API 设计](./docs/02-api-design.md) - API 端点和数据模型
- [前端 SDK](./docs/03-frontend-sdk.md) - 组件集成指南
- [安全防护](./docs/04-security.md) - 防刷措施
- [开发路线图](./docs/05-roadmap.md) - 开发时间线
- [进度追踪](./docs/00-progress.md) - 当前开发状态
- [验收报告](./docs/08-acceptance-report.md) - 项目验收报告

---

## 技术栈

- **计算层**: Next.js with Edge Runtime (Vercel)
- **存储层**: Upstash Redis (无服务器 Redis)
- **前端**: Preact + Vite
- **安全层**: Cloudflare Turnstile
- **UI**: Web Components with Shadow DOM

---

## 对比

| | V-Waitlist | Viral Loops |
|---|---|---|
| **价格** | $0 | $99/月起 |
| **性能** | <100ms | 较慢 |
| **数据** | 你自己的 Redis | 他们的平台 |
| **集成难度** | 3 行代码 | 复杂 |

---

## 贡献

欢迎贡献！随时提交 Pull Request。

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

[MIT](./LICENSE) - Copyright (c) 2025 V-Waitlist Contributors

---

**Built with** - [Next.js](https://nextjs.org) · [Upstash Redis](https://upstash.com) · [Preact](https://preactjs.com) · [Cloudflare](https://cloudflare.com)
