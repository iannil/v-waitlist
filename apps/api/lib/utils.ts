import { customAlphabet } from 'nanoid';

/**
 * Generate a unique referral code
 * Excludes confusing characters: 0, O, 1, l, I, 5, S, 2, Z, 9, g, v, V
 */
export const generateRefCode = customAlphabet(
  '6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz',
  8
);

/**
 * Disposable email domain blacklist
 */
export const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'trashmail.com',
  'getairmail.com',
  'yopmail.com',
  'maildrop.cc',
  'throwaway.email',
  'fakeinbox.com',
]);

/**
 * Check if email is from a disposable domain
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

/**
 * Basic email validation
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
