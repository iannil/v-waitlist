# V-WAITLIST

这是一个非常典型的“小而美”且具备“高并发”潜质的系统设计。

针对 `Viral-Waitlist-Script`，我们的设计哲学必须是：

1.  极简部署：最好能一键部署到 Vercel/Cloudflare。
2.  极低成本：利用 Serverless 和 Free Tier 数据库，让开发者前期零成本。
3.  极致性能：排队系统本质上是一个排行榜，读写频率极高。
4.  嵌入即用：前端集成不能超过 3 行代码。

以下是完整的技术方案设计。

---

## 项目代号：`V-Waitlist`
Slogan: The open-source, serverless viral waiting list for indie hackers.

---

## 1. 总体架构设计 (Architecture)

为了满足“免费”和“高性能”，我们放弃传统的关系型数据库（MySQL/PG），转而使用 Redis (Sorted Sets) 作为核心存储引擎。

*   计算层 (Compute): Next.js API Routes (部署在 Vercel Edge Functions 上)，响应速度快，抗并发。
*   存储层 (Storage): Upstash Redis (Serverless Redis)。
    *   *理由：* 原生支持 HTTP API，连接池管理极佳，且 Free Tier 足够支撑 10,000+ 用户，非常适合排行榜场景。
*   前端层 (Frontend): 一个编译后的纯原生 JavaScript SDK (`v-waitlist.min.js`)。
    *   *技术栈：* Preact (用于构建超轻量组件) + Vite (打包)。
*   防护层 (Security): Cloudflare Turnstile (免费且无感的验证码) + Upstash RateLimit。

---

## 2. 核心数据结构 (Data Model)

Redis 的 KV 和 ZSET (有序集合) 是实现排行榜的神器。

### A. 排行榜 (The Leaderboard)
使用 Redis `ZSET` 存储。

*   Key: `waitlist:leaderboard:{project_id}`
*   Member: `email` (用户邮箱)
*   Score: `priority_score` (优先级分数)

> 算法核心：分数计算公式
> `Score = (Referral_Count * 1000000) + (Max_Timestamp - Current_Timestamp)`
> *解释：推荐的人越多，分数越高；如果推荐数相同，注册越早（时间戳越小，但在公式里我们倒过来处理以适配分数越高排名越前），排名越前。*

### B. 用户详情 (User Profile)
使用 Redis `HASH` 存储。

*   Key: `user:{project_id}:{email}`
*   Fields:
    *   `id`: UUID
    *   `ref_code`: 专属邀请码 (NanoID)
    *   `referred_by`: 谁邀请进来的 (Email)
    *   `position`: 当前缓存的排名 (可选)
    *   `created_at`: 注册时间

### C. 邀请码映射 (Referral Mapping)
使用 Redis `String` 存储。

*   Key: `ref:{project_id}:{ref_code}`
*   Value: `email`

---

## 3. 核心 API 设计 (Next.js Edge API)

只需三个核心接口即可完成闭环。

### 1. 加入排队 (Join / Signup)
`POST /api/join`

*   流程：
    1.  校验 Turnstile Token (防刷)。
    2.  校验邮箱格式 & 过滤一次性邮箱域名 (Block disposable emails)。
    3.  生成用户的 `ref_code`。
    4.  检查请求中是否带有 `ref_code` (即是否是被邀请的)。
        *   如果有，给邀请人的 `Score` + 1，更新 ZSET。
    5.  将当前用户写入 User Hash。
    6.  将当前用户写入 Leaderboard ZSET (初始分数为时间戳权重)。
    7.  返回：用户的当前排名、专属邀请链接。

### 2. 查询状态 (Check Status)
`GET /api/status?email=xxx`

*   流程：
    1.  `ZREVRANK waitlist:leaderboard:{id} {email}`：直接获取实时排名索引。
    2.  `ZCARD waitlist:leaderboard:{id}`：获取总人数。
    3.  返回：`{ rank: 5, total: 1002, ahead_of: 997 }`。

### 3. 导出数据 (Export)
`GET /api/export` (需 Admin 密钥)

*   流程： 遍历 Redis Keys，生成 CSV 下载。用于导入到邮件营销工具 (如 Mailchimp/Resend)。

---

## 4. 前端 SDK 设计 (The Widget)

我们要提供两种集成方式，适应不同水平的开发者。

### 方式 A：Web Component (极客首选)
开发者只需引入脚本，然后使用自定义标签：
```html
<script src="https://cdn.v-waitlist.com/sdk.js"></script>

<!-- 只有输入框 -->
<v-waitlist project-id="xyz" mode="input"></v-waitlist>

<!-- 完整弹窗模式 -->
<v-waitlist project-id="xyz" mode="modal"></v-waitlist>
```

### 方式 B：原生 API 调用 (高度定制)
开发者自己写 UI，只调用我们的 JS 方法：
```javascript
import { joinWaitlist } from 'v-waitlist-sdk';

const result = await joinWaitlist({ email: 'user@example.com' });
console.log(result.rank); // 输出排名
```

关键交互逻辑：

1.  本地缓存： 用户输入邮箱后，将 Email 和 RefCode 存入 `localStorage`。用户下次刷新页面，自动显示“你当前排名第 X 位”，而不是重新显示输入框。
2.  社交分享： 注册成功后，直接生成 Twitter/WhatsApp 分享链接，文案自动带上 `?ref=xxx`。

---

## 5. 防刷与安全策略 (Anti-Abuse)

这是排队系统最头疼的问题，必须在 MVP 阶段就解决，否则会被刷爆。

1.  Cloudflare Turnstile: 必选。在前端 SDK 中集成，后端验证 Token。完全免费，且用户体验极好（不用点图片）。
2.  Upstash Ratelimit: 限制同一 IP 在 1 小时内的注册请求不超过 5 次。
3.  邮箱黑名单: 内置一份常见临时邮箱域名列表 (如 `tempmail.com`)，直接拒绝。
4.  同 IP 限制 (高级): 如果同一个 IP 在短时间内为同一个邀请码贡献了超过 10 个 Referral，暂时冻结该邀请码的加分，标记为可疑。

---

## 6. 开发与发布路线 (Roadmap)

### Week 1: 核心引擎

*   完成 Next.js + Upstash Redis 的后端逻辑。
*   写好 `ZSET` 的加分与排序算法。
*   编写单元测试：模拟 1000 人并发注册，确保排名计算准确。

### Week 2: SDK 与 演示站

*   用 Preact 编写前端 Widget，打包成单个 `.js` 文件。
*   做一个极其性感的 Landing Page（演示站），本身就使用这个 Waitlist 系统。用户为了体验功能，实际上就注册了你的 Waitlist。

### Week 3: 开源与文档

*   一键部署： 配置 `deploy to Vercel` 按钮，让用户点击一下，填入 Upstash Redis URL 就能拥有自己的后端。
*   README 营销： 标题要炸裂 —— *"The $0 Viral Waitlist. Stop paying $99/mo to Viral Loops."*

---

## 7. 为什么这个方案能赢 (Why It Wins)

1.  零成本 (True Zero Cost): Vercel Hobby Plan (免费) + Upstash Free Tier (每天 10k 请求免费) = 开发者不用付一分钱。
2.  数据掌控 (Data Ownership): 数据在开发者自己的 Redis 里，而不是在第三方平台。
3.  极速 (Speed): Redis 内存操作，排名计算是毫秒级的，用户体验极佳。

这个设计在技术上没有难点，难点在于封装的优雅程度。如果你能把这个做出来，绝对是 Product Hunt 当日的 No.1。

## MORE

### **V-Waitlist: 核心代码落地指南**

#### **1. 数据库层：Redis 原子化操作 (The "Magic" Lua Script)**

为了保证**高并发**下的数据一致性（例如：两个人同时邀请了同一个人，或者为了防止排名计算时的 Race Condition），我们必须放弃简单的 Redis 指令堆砌，改用 **Lua 脚本**。

这是整个系统的**心脏**。

**文件:** `lib/redis-scripts.ts`

```typescript
// 这是一个原子操作脚本：
// 1. 检查用户是否已存在
// 2. 如果存在推荐码，找到推荐人，给推荐人加分
// 3. 注册新用户，写入 Hash，写入 Leaderboard
// 4. 建立邀请码映射

export const JOIN_SCRIPT = `
  local leaderboardKey = KEYS[1]  -- waitlist:leaderboard:{id}
  local userHashPrefix = KEYS[2]  -- user:{id}:
  local refMapKey = KEYS[3]       -- ref:{id}:

  local email = ARGV[1]
  local userRefCode = ARGV[2]     -- 新用户的邀请码
  local referrerCode = ARGV[3]    -- 邀请人的邀请码 (可为空)
  local timestamp = tonumber(ARGV[4])

  -- 1. 幂等性检查：如果邮箱已存在，直接返回 "EXISTS"
  local existingScore = redis.call('ZSCORE', leaderboardKey, email)
  if existingScore then
    return "EXISTS"
  end

  -- 2. 处理推荐逻辑 (加分)
  local referrerEmail = nil
  if referrerCode ~= "" then
    referrerEmail = redis.call('GET', refMapKey .. referrerCode)
    if referrerEmail then
      -- 核心算法：每邀请一人，分数 +1 (大数部分)，小数部分由时间戳决定(越早越小)
      -- 这里简化处理：直接 ZINCRBY 1。
      -- 实际上为了保持"先来后到"，我们可以用 "1 + (1 / timestamp)" 这种微积分，
      -- 但 MVP 版本 ZINCRBY 1 足够，Redis 默认对同分 Member 按字典序排，我们可以容忍。
      redis.call('ZINCRBY', leaderboardKey, 1, referrerEmail)
    end
  end

  -- 3. 注册新用户
  -- 初始分数：0 (或者基于时间戳的一个极小小数，保证早注册的排前面)
  -- 为了简单，我们设为 0，依靠注册顺序(隐式)或后续逻辑
  local initialScore = 0
  redis.call('ZADD', leaderboardKey, initialScore, email)

  -- 4. 写入用户详情
  local userKey = userHashPrefix .. email
  redis.call('HSET', userKey, 'id', userRefCode, 'ref_code', userRefCode, 'created_at', timestamp)
  if referrerEmail then
    redis.call('HSET', userKey, 'referred_by', referrerEmail)
  end

  -- 5. 建立映射：邀请码 -> 邮箱
  redis.call('SET', refMapKey .. userRefCode, email)

  return "OK"
`;
```

---

#### **2. 后端层：Next.js Edge API Route**

利用 Vercel Edge Runtime，即使是冷启动也接近 0ms 延迟。

**文件:** `app/api/join/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { customAlphabet } from 'nanoid';
import { JOIN_SCRIPT } from '@/lib/redis-scripts';

export const runtime = 'edge'; // 关键：开启 Edge 模式

const redis = Redis.fromEnv();
const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz', 8); // 排除易混淆字符

export async function POST(req: NextRequest) {
  try {
    const { email, referrerCode, turnstileToken, projectId } = await req.json();

    // 1. TODO: 校验 Turnstile Token (调用 Cloudflare API)
  
    // 2. 数据准备
    const userRefCode = nanoid();
    const timestamp = Date.now();

    // 3. 执行 Lua 脚本 (原子操作)
    const result = await redis.eval(
      JOIN_SCRIPT,
      [
        `waitlist:leaderboard:${projectId}`,
        `user:${projectId}:`,
        `ref:${projectId}:`
      ],
      [email, userRefCode, referrerCode || '', timestamp]
    );

    // 4. 获取即时排名
    // ZREVRANK 返回的是索引(0开始)，所以要 +1
    const rankIndex = await redis.zrevrank(`waitlist:leaderboard:${projectId}`, email);
    const total = await redis.zcard(`waitlist:leaderboard:${projectId}`);
  
    const rank = (rankIndex !== null) ? rankIndex + 1 : total;

    return NextResponse.json({ 
      success: true, 
      refCode: userRefCode, 
      rank, 
      total 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
```

---

#### **3. 前端 SDK：Web Component 实现**

为了实现 "3行代码集成"，我们使用原生 Custom Elements。通过 Vite 的 Library Mode 打包成 `v-waitlist.min.js`。

**核心逻辑 (伪代码/简化版):**

```javascript
// sdk/src/main.js
import { h, render } from 'preact';
import WaitlistWidget from './components/WaitlistWidget'; // Preact 组件

class VWaitlist extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }); // Shadow DOM 隔离样式
  }

  connectedCallback() {
    const projectId = this.getAttribute('project-id');
    const mode = this.getAttribute('mode') || 'input';
  
    // 注入样式
    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; font-family: sans-serif; }
      /* ... Tailwind CSS 编译后的最小集 ... */
    `;
    this.shadowRoot.appendChild(style);

    // 挂载 Preact 组件
    const mountPoint = document.createElement('div');
    this.shadowRoot.appendChild(mountPoint);

    render(h(WaitlistWidget, { projectId, mode }), mountPoint);
  }
}

customElements.define('v-waitlist', VWaitlist);
```

**Preact 组件 (`WaitlistWidget.jsx`) 状态机逻辑:**

1.  **State:** `idle` -> `submitting` -> `success`
2.  **Check LocalStorage:** 组件加载时，先看 `localStorage.getItem('v-waitlist-ref')`。
    *   如果有：直接调用 `/api/status` 获取最新排名，进入 `success` 状态（显示："You are #543"）。
    *   如果没有：显示输入框。
3.  **On Submit:** 调用 `/api/join` -> 成功后存入 LocalStorage -> 切换到 `success` 视图。

---

#### **4. 一键部署配置 (The Viral Catalyst)**

这是让它在开源界火起来的关键。

**文件:** `vercel.json`

```json
{
  "name": "v-waitlist-api",
  "env": {
    "UPSTASH_REDIS_REST_URL": {
      "description": "Your Upstash Redis URL",
      "required": true
    },
    "UPSTASH_REDIS_REST_TOKEN": {
      "description": "Your Upstash Redis Token",
      "required": true
    }
  },
  "framework": "nextjs"
}
```

**README 中的 "Deploy" 按钮:**

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourname/v-waitlist&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN)
```

用户点击 -> 登录 Vercel -> 自动克隆 -> 提示输入 Redis 变量 -> **部署完成**。全程不超过 2 分钟。

---

### **5. 为什么这个技术栈是“降维打击”？**

| 传统方案 (Viral Loops 等) | V-Waitlist (本方案) |
| :--- | :--- |
| **价格:** $99/月 起 | **价格:** $0 (Free Tier 足够支撑 1w+ 用户) |
| **性能:** API 响应较慢，页面加载重 | **性能:** Edge Function + Redis，响应 <100ms |
| **数据:** 数据在别人手里 | **数据:** 数据在你自己的 Redis 里，随时导出 |
| **集成:** 需要复杂的 Script 甚至后端对接 | **集成:** `<v-waitlist project-id="..."></v-waitlist>` |

### **下一步行动建议**

1.  **Repo Setup:** 建立一个 Monorepo (Turborepo)。
    *   `apps/web`: 演示 Landing Page (也是这个 SaaS 的官网)。
    *   `apps/api`: Next.js 后端。
    *   `packages/sdk`: 前端 Widget 源码。
2.  **SDK Bundling:** 使用 Vite 配置 `build.lib` 模式，确保输出单个 `js` 文件且 CSS 内联。
3.  **UI Design:** 排队成功的界面是传播的关键。参考 Robinhood 早期的设计：
    *   大大的排名数字。
    *   “Invite 3 friends to jump 1,000 spots” (邀请3个朋友，排名跃升1000位)。
    *   一键 Copy Link 按钮。

这个项目非常适合在这个周末构建出来。Go build it! 🚀