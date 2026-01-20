import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { generateRefCode, isDisposableEmail, isValidEmail } from '@/lib/utils';
import { JOIN_SCRIPT } from '@/lib/redis-scripts';
import { verifyTurnstileToken } from '@/lib/turnstile';

export const runtime = 'edge';

// Rate limiting: 5 requests per hour per IP
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1h'),
  analytics: false,
});

interface JoinRequest {
  email: string;
  projectId: string;
  referrerCode?: string;
  turnstileToken?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: JoinRequest = await req.json();
    const { email, projectId, referrerCode, turnstileToken } = body;

    // 1. Validate input
    if (!email || !projectId) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json({ error: 'DISPOSABLE_EMAIL' }, { status: 400 });
    }

    // 2. Rate limiting
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    const { success } = await ratelimit.limit(`waitlist:join:${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 });
    }

    // 3. Verify Turnstile token
    const turnstileResult = await verifyTurnstileToken(turnstileToken || '', ip);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: 'INVALID_CAPTCHA', details: turnstileResult.error },
        { status: 400 }
      );
    }

    // 4. Execute Lua script (atomic operation)
    const userRefCode = generateRefCode();
    const result = (await Redis.fromEnv().eval(
      JOIN_SCRIPT,
      [
        `waitlist:leaderboard:${projectId}`,
        `user:${projectId}:`,
        `ref:${projectId}:`,
      ],
      [email, userRefCode, referrerCode || '', String(Date.now())]
    )) as string;

    if (result === 'EXISTS') {
      const redis = Redis.fromEnv();
      const existingUser = await redis.hget(`user:${projectId}:${email}`, 'ref_code');
      return NextResponse.json({
        success: false,
        error: 'ALREADY_JOINED',
        existingUser: { refCode: existingUser },
      });
    }

    // 5. Get current rank
    const redis = Redis.fromEnv();
    const total = await redis.zcard(`waitlist:leaderboard:${projectId}`);
    // User was just added, so rank = total
    const rank = total;

    return NextResponse.json({
      success: true,
      refCode: userRefCode,
      rank,
      total,
      shareUrl: `?ref=${userRefCode}`,
    });

  } catch (error) {
    console.error('Join error:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
