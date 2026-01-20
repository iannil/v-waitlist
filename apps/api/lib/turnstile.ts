/**
 * Cloudflare Turnstile verification
 *
 * Docs: https://developers.cloudflare.com/turnstile/
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile is not configured, skip verification (for development)
  if (!secret || secret === '') {
    console.warn('TURNSTILE_SECRET_KEY not set, skipping verification');
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'MISSING_TOKEN' };
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: remoteIp,
        }),
      }
    );

    const data: TurnstileVerifyResponse = await response.json();

    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      error: data['error-codes']?.join(', ') || 'VERIFICATION_FAILED',
    };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'NETWORK_ERROR' };
  }
}
