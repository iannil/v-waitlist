/**
 * Lua script for atomic user registration
 *
 * This script ensures that under high concurrency:
 * 1. Duplicate registrations are prevented
 * 2. Referral points are added atomically
 * 3. User data is written consistently
 *
 * Returns:
 *   "OK" - User registered successfully
 *   "EXISTS" - Email already registered
 */
export const JOIN_SCRIPT = `
local leaderboardKey = KEYS[1]
local userHashPrefix = KEYS[2]
local refMapKey = KEYS[3]

local email = ARGV[1]
local userRefCode = ARGV[2]
local referrerCode = ARGV[3]
local timestamp = ARGV[4]

-- 1. Idempotency check: if email exists, return "EXISTS"
local existingScore = redis.call('ZSCORE', leaderboardKey, email)
if existingScore then
  return "EXISTS"
end

-- 2. Handle referral logic (add points to referrer)
local referrerEmail = nil
if referrerCode ~= "" then
  referrerEmail = redis.call('GET', refMapKey .. referrerCode)
  if referrerEmail then
    -- Increment referrer score by 1
    redis.call('ZINCRBY', leaderboardKey, 1, referrerEmail)
  end
end

-- 3. Register new user with initial score of 0
redis.call('ZADD', leaderboardKey, 0, email)

-- 4. Write user details to hash
local userKey = userHashPrefix .. email
redis.call('HSET', userKey, 'ref_code', userRefCode, 'created_at', timestamp)
if referrerEmail then
  redis.call('HSET', userKey, 'referred_by', referrerEmail)
end

-- 5. Create mapping: ref_code -> email
redis.call('SET', refMapKey .. userRefCode, email)

return "OK"
`;
