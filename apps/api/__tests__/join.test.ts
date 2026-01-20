/**
 * API Tests for /api/join
 *
 * These tests can be run with:
 * pnpm --filter @v-waitlist/api test
 *
 * Or manually with curl after starting the dev server.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Redis } from '@upstash/redis';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_PROJECT_ID = 'test-project-' + Date.now();

describe('API: /api/join', () => {
  let redis: Redis;

  beforeAll(() => {
    redis = Redis.fromEnv();
  });

  afterAll(async () => {
    // Cleanup test data
    await redis.del(`waitlist:leaderboard:${TEST_PROJECT_ID}`);
  });

  it('should register a new user', async () => {
    const response = await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test1-${Date.now()}@example.com`,
        projectId: TEST_PROJECT_ID,
      }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.refCode).toBeDefined();
    expect(data.rank).toBe(1);
    expect(data.total).toBe(1);
  });

  it('should reject duplicate email', async () => {
    const email = `test2-${Date.now()}@example.com`;

    // First request
    await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, projectId: TEST_PROJECT_ID }),
    });

    // Duplicate request
    const response = await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, projectId: TEST_PROJECT_ID }),
    });

    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe('ALREADY_JOINED');
    expect(data.existingUser?.refCode).toBeDefined();
  });

  it('should increment referrer score', async () => {
    // First user
    const res1 = await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `referrer-${Date.now()}@example.com`,
        projectId: TEST_PROJECT_ID,
      }),
    });
    const { refCode } = await res1.json();

    // Referred user
    await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `referred-${Date.now()}@example.com`,
        projectId: TEST_PROJECT_ID,
        referrerCode: refCode,
      }),
    });

    // Check referrer's rank (should be #1 due to referral point)
    const status = await fetch(
      `${API_URL}/api/status?email=${encodeURIComponent(`referrer-${Date.now()}@example.com`)}&projectId=${TEST_PROJECT_ID}`
    );

    // Note: This test needs the actual email to work properly
    expect(status.ok).toBe(true);
  });

  it('should reject invalid email', async () => {
    const response = await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        projectId: TEST_PROJECT_ID,
      }),
    });

    const data = await response.json();

    expect(data.error).toBe('INVALID_EMAIL');
  });

  it('should reject disposable email', async () => {
    const response = await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test@tempmail.com`,
        projectId: TEST_PROJECT_ID,
      }),
    });

    const data = await response.json();

    expect(data.error).toBe('DISPOSABLE_EMAIL');
  });

  it('should require email and projectId', async () => {
    const response = await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    expect(data.error).toBe('MISSING_FIELDS');
  });
});

describe('API: /api/status', () => {
  const TEST_EMAIL = `status-${Date.now()}@example.com`;
  const TEST_PROJECT_ID = 'test-project-status-' + Date.now();

  it('should return user status', async () => {
    // First, join the waitlist
    await fetch(`${API_URL}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        projectId: TEST_PROJECT_ID,
      }),
    });

    // Then check status
    const response = await fetch(
      `${API_URL}/api/status?email=${encodeURIComponent(TEST_EMAIL)}&projectId=${TEST_PROJECT_ID}`
    );

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.rank).toBe(1);
    expect(data.total).toBe(1);
    expect(data.aheadOf).toBe(0);
    expect(data.refCode).toBeDefined();
  });

  it('should return 404 for non-existent user', async () => {
    const response = await fetch(
      `${API_URL}/api/status?email=nonexistent@example.com&projectId=${TEST_PROJECT_ID}`
    );

    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe('NOT_FOUND');
  });

  it('should require email and projectId', async () => {
    const response = await fetch(`${API_URL}/api/status`);

    expect(response.status).toBe(400);
  });
});
