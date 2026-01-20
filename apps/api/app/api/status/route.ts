import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    const projectId = searchParams.get('projectId');

    if (!email || !projectId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    const redis = Redis.fromEnv();

    // Get total count
    const total = await redis.zcard(`waitlist:leaderboard:${projectId}`);

    // Get user rank (0-based index) - use zrange with rev to get descending order
    const members = await redis.zrange(`waitlist:leaderboard:${projectId}`, 0, -1, { rev: true });
    const rankIndex = members.indexOf(email);

    if (rankIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get user details
    const user = (await redis.hgetall(`user:${projectId}:${email}`)) || {};

    // Calculate referral count (score = number of referrals)
    const score = await redis.zscore(`waitlist:leaderboard:${projectId}`, email);
    const referralCount = score ? Math.floor(Number(score)) : 0;

    return NextResponse.json({
      success: true,
      rank: rankIndex + 1,
      total,
      aheadOf: total - rankIndex - 1,
      refCode: (user as any).ref_code || '',
      referralCount,
      shareUrl: `?ref=${(user as any).ref_code || ''}`,
    });

  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
