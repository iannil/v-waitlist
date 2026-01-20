import { useState, useCallback } from 'preact/hooks';

interface JoinResponse {
  success: boolean;
  refCode?: string;
  rank?: number;
  total?: number;
  shareUrl?: string;
  error?: string;
  existingUser?: { refCode: string };
}

interface StatusResponse {
  success: boolean;
  rank?: number;
  total?: number;
  aheadOf?: number;
  refCode?: string;
  referralCount?: number;
  shareUrl?: string;
  error?: string;
}

interface UseWaitlistReturn {
  join: (email: string, projectId: string, referrerCode?: string) => Promise<JoinResponse>;
  status: (email: string, projectId: string) => Promise<StatusResponse>;
  loading: boolean;
}

export function useWaitlist(apiBaseUrl: string = ''): UseWaitlistReturn {
  const [loading, setLoading] = useState(false);

  const getApiUrl = (endpoint: string) => {
    const baseUrl = apiBaseUrl || window.location.origin;
    return `${baseUrl}/api/${endpoint}`;
  };

  const join = useCallback(
    async (email: string, projectId: string, referrerCode?: string): Promise<JoinResponse> => {
      setLoading(true);
      try {
        const response = await fetch(getApiUrl('join'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            projectId,
            referrerCode,
            // Turnstile token would be added here if using the widget with CAPTCHA
            turnstileToken: '',
          }),
        });

        const data: JoinResponse = await response.json();
        setLoading(false);
        return data;
      } catch (error) {
        setLoading(false);
        return { success: false, error: 'Network error' };
      }
    },
    [apiBaseUrl]
  );

  const status = useCallback(
    async (email: string, projectId: string): Promise<StatusResponse> => {
      setLoading(true);
      try {
        const response = await fetch(
          getApiUrl(`status?email=${encodeURIComponent(email)}&projectId=${projectId}`)
        );

        const data: StatusResponse = await response.json();
        setLoading(false);
        return data;
      } catch (error) {
        setLoading(false);
        return { success: false, error: 'Network error' };
      }
    },
    [apiBaseUrl]
  );

  return { join, status, loading };
}
