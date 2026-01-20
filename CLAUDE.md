# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

**V-Waitlist** 是一个面向独立开发者的开源、无服务器病毒式等待名单系统。目标是成为 Viral Loops 等付费服务的零成本替代方案。

**当前状态**: 早期规划阶段 - 仅有文档，尚未实现任何代码。

## 技术栈

- **计算层**: Next.js with Edge Runtime (Vercel)
- **存储层**: Upstash Redis (支持 HTTP API 的无服务器 Redis)
- **前端 SDK**: Preact + Vite (编译为单个 `v-waitlist.min.js` 文件)
- **安全层**: Cloudflare Turnstile (验证码) + Upstash RateLimit
- **UI**: 原生 Web Components (`<v-waitlist>` 自定义元素)

## 计划的 Monorepo 结构

```
apps/web       # 落地页 / 演示站点
apps/api       # Next.js 后端（Edge API 路由）
packages/sdk   # 前端组件源码
```

## 核心架构

### 数据模型 (Redis)

所有数据存储在 Upstash Redis 中：

1. **排行榜** (ZSET): `waitlist:leaderboard:{project_id}`
   - 分数公式: `(推荐人数 * 1000000) + (最大时间戳 - 当前时间戳)`
   - 分数越高，排名越靠前

2. **用户资料** (HASH): `user:{project_id}:{email}`
   - 字段: `id`, `ref_code`, `referred_by`, `position`, `created_at`

3. **邀请码映射** (STRING): `ref:{project_id}:{ref_code}` → `email`

### API 端点

- `POST /api/join` - 用户注册及推荐跟踪
- `GET /api/status?email=xxx` - 查询用户当前排名
- `GET /api/export` - 导出数据为 CSV（仅管理员）

### 关键：原子操作

所有 Redis 操作必须使用 Lua 脚本确保原子性，防止高并发下的竞态条件。核心 `JOIN_SCRIPT` 见 README 中的 `lib/redis-scripts.ts`。

## 前端集成

两种集成方式：

1. **Web Component**:
   ```html
   <script src="https://cdn.v-waitlist.com/sdk.js"></script>
   <v-waitlist project-id="xyz" mode="modal|input"></v-waitlist>
   ```

2. **仅 API 调用**:
   ```javascript
   import { joinWaitlist } from 'v-waitlist-sdk';
   const result = await joinWaitlist({ email: 'user@example.com' });
   ```

## 防刷措施

- Cloudflare Turnstile 验证（注册时必需）
- 速率限制：每个 IP 每小时最多 5 次注册
- 一次性邮箱域名拦截
- 异常活动检测（同一 IP、同一推荐码、超过 10 个推荐）

## 环境变量

部署所需变量：
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST API 地址
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis 认证令牌

## 一键部署

`vercel.json` 配置支持 Vercel 的 "Deploy" 按钮，实现即时克隆部署：
- 用户点击按钮
- Vercel 克隆仓库
- 用户输入 Redis 凭证
- 2 分钟内完成部署
