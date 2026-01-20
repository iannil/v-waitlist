import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const authHeader = req.headers.get('authorization');

    // Verify admin secret key
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'MISSING_PROJECT_ID' },
        { status: 400 }
      );
    }

    const redis = Redis.fromEnv();

    // Get all members with scores (descending order)
    const members = await redis.zrange(
      `waitlist:leaderboard:${projectId}`,
      0,
      -1,
      { rev: true, withScores: true }
    );

    if (!members || members.length === 0) {
      // Return empty CSV
      return new NextResponse('email,ref_code,referred_by,referral_count,created_at,rank\n', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="waitlist-${projectId}-${Date.now()}.csv"`,
        },
      });
    }

    // Build CSV
    const rows = ['email,ref_code,referred_by,referral_count,created_at,rank'];

    for (let i = 0; i < members.length; i += 2) {
      const email = members[i];
      const score = members[i + 1];
      const user = (await redis.hgetall(`user:${projectId}:${email}`)) || {};

      rows.push(
        [
          email,
          (user as any).ref_code || '',
          (user as any).referred_by || '',
          Math.floor(Number(score)),
          (user as any).created_at || '',
          Math.floor(i / 2) + 1,
        ].join(',')
      );
    }

    const csv = rows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="waitlist-${projectId}-${Date.now()}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
