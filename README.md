# V-Waitlist

<div align="center">

> The open-source, serverless viral waiting list for indie hackers

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/iannil/v-waitlist&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,ADMIN_SECRET_KEY&project-name=v-waitlist&repository-name=v-waitlist)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/iannil/v-waitlist)

</div>

---

## What is V-Waitlist?

**V-Waitlist** is a zero-cost alternative to services like Viral Loops. Build viral waiting lists with referral systems, leaderboards, and social sharing.

- **$0/month** - Uses free tiers of Vercel + Upstash Redis
- **3 lines to integrate** - Drop in `<v-waitlist>` and you're done
- **Lightning fast** - Edge Functions + Redis, <100ms response
- **You own the data** - Stored in your own Redis instance

---

## Features

| Feature | Description |
|---------|-------------|
| 🎯 **Viral Referrals** | Users climb the leaderboard by referring others |
| 📊 **Real-time Rankings** | Redis-powered, millisecond response times |
| 🛡️ **Anti-Abuse** | Cloudflare Turnstile + rate limiting + email filtering |
| 📤 **Export** | Export to CSV for email marketing tools |
| 🌙 **Dark Mode** | Built-in light and dark themes |
| 🎨 **Customizable** | Custom colors via attributes |
| ⚡ **Edge Runtime** | Global distribution with sub-second cold starts |

---

## Quick Start

### 1. Deploy to Vercel

Click the "Deploy with Vercel" button above. You'll need:

- An [Upstash Redis](https://upstash.com) account (free tier works)
- Your Redis REST URL and Token

### 2. Add to your site

```html
<script src="https://your-app.vercel.app/sdk.js"></script>
<v-waitlist project-id="your-project-id"></v-waitlist>
```

### 3. Done

Your waitlist is now live. Users can sign up and start referring others.

---

## Configuration

### Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `project-id` | string | Yes | - | Your unique project identifier |
| `mode` | string | No | `input` | `input` or `modal` |
| `theme` | string | No | `light` | `light` or `dark` |
| `primary-color` | string | No | `#000000` | Primary color in hex format |
| `api-base-url` | string | No | (current origin) | Custom API base URL |

### Example

```html
<v-waitlist
  project-id="my-product"
  mode="modal"
  theme="dark"
  primary-color="#6366f1"
></v-waitlist>
```

---

## Self-Hosting

```bash
# Clone the repository
git clone https://github.com/iannil/v-waitlist.git
cd v-waitlist

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example apps/api/.env.local
```

Edit `apps/api/.env.local` with your credentials:

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXX...
TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
ADMIN_SECRET_KEY=your-secret-key
```

```bash
# Run development server
pnpm dev

# Build for production
pnpm build
```

---

## Development

```bash
# Install dependencies
pnpm install

# Run API dev server (http://localhost:3000)
pnpm --filter @v-waitlist/api dev

# Run SDK dev server (http://localhost:5173)
pnpm --filter @v-waitlist/sdk dev

# Run web dev server (http://localhost:3001)
pnpm --filter @v-waitlist/web dev

# Run all dev servers
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

---

## Project Structure

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
│   └── web/              # Landing page
├── packages/
│   └── sdk/              # Frontend widget (Preact + Vite)
│       └── dist/
│           └── v-waitlist.min.js  # 19KB (7.89KB gzipped)
├── docs/                 # Documentation
├── LICENSE               # MIT License
└── vercel.json           # Deployment config
```

---

## API Documentation

### POST /api/join

Register a new user to the waitlist.

**Request:**

```json
{
  "email": "user@example.com",
  "projectId": "my-project",
  "referrerCode": "abc12345",
  "turnstileToken": "0x..."
}
```

**Response:**

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

Get user's current rank and statistics.

**Request:**

```
GET /api/status?email=user@example.com&projectId=my-project
```

**Response:**

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

Export all users as CSV (requires admin key).

**Request:**

```
GET /api/export?projectId=my-project
Authorization: Bearer YOUR_ADMIN_SECRET_KEY
```

**Response:**

```
email,ref_code,referred_by,referral_count,created_at,rank
user1@example.com,abc12345,,5,2025-01-19T10:30:00Z,10
```

For full API documentation, see [`docs/02-api-design.md`](./docs/02-api-design.md).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST API URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis authentication token |
| `TURNSTILE_SITE_KEY` | No | Cloudflare Turnstile Site Key |
| `TURNSTILE_SECRET_KEY` | No | Cloudflare Turnstile Secret Key |
| `ADMIN_SECRET_KEY` | Yes | Secret key for `/api/export` |

---

## Documentation

- [Architecture](./docs/01-architecture.md) - System design and tech stack
- [API Design](./docs/02-api-design.md) - API endpoints and data models
- [Frontend SDK](./docs/03-frontend-sdk.md) - Widget integration guide
- [Security](./docs/04-security.md) - Anti-abuse measures
- [Roadmap](./docs/05-roadmap.md) - Development timeline
- [Progress](./docs/00-progress.md) - Current development status
- [Acceptance Report](./docs/08-acceptance-report.md) - Project acceptance report

---

## Tech Stack

- **Compute**: Next.js with Edge Runtime (Vercel)
- **Storage**: Upstash Redis (serverless Redis)
- **Frontend**: Preact + Vite
- **Security**: Cloudflare Turnstile
- **UI**: Web Components with Shadow DOM

---

## Comparison

| | V-Waitlist | Viral Loops |
|---|---|---|
| **Price** | $0 | $99/mo+ |
| **Performance** | <100ms | Slower |
| **Data** | Your Redis | Their platform |
| **Integration** | 3 lines | Complex |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

[MIT](./LICENSE) - Copyright (c) 2025 V-Waitlist Contributors

---

**Built with** - [Next.js](https://nextjs.org) · [Upstash Redis](https://upstash.com) · [Preact](https://preactjs.com) · [Cloudflare](https://cloudflare.com)
