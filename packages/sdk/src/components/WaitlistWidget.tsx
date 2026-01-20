import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useWaitlist } from '../hooks/useWaitlist';

// Types
export type WidgetMode = 'input' | 'modal';
export type Theme = 'light' | 'dark';

interface WaitlistWidgetProps {
  projectId: string;
  mode?: WidgetMode;
  theme?: Theme;
  primaryColor?: string;
  apiBaseUrl?: string;
  onSuccess?: (data: SuccessData) => void;
  onError?: (error: string) => void;
}

export interface SuccessData {
  refCode: string;
  rank: number;
  total: number;
  shareUrl: string;
}

type WidgetState = 'idle' | 'submitting' | 'success' | 'error';

export function WaitlistWidget({
  projectId,
  mode = 'input',
  theme = 'light',
  primaryColor = '#000000',
  apiBaseUrl = '',
  onSuccess,
  onError,
}: WaitlistWidgetProps) {
  const [state, setState] = useState<WidgetState>('idle');
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState<SuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { join, status, loading } = useWaitlist(apiBaseUrl);

  // Check localStorage for existing user
  useEffect(() => {
    const stored = localStorage.getItem('v-waitlist-user');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.projectId === projectId && data.email) {
          // Fetch latest status
          fetchStatus(data.email);
        }
      } catch {
        // Ignore invalid stored data
      }
    }

    // Check URL for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('v-waitlist-ref', refCode);
    }
  }, [projectId]);

  const fetchStatus = async (email: string) => {
    try {
      const result = await status(email, projectId);
      setUserData(result);
      setState('success');
    } catch (err) {
      setState('idle');
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email');
      setState('error');
      return;
    }

    setState('submitting');
    setErrorMessage('');

    // Get referral code from localStorage
    const referrerCode = localStorage.getItem('v-waitlist-ref') || undefined;

    try {
      const result = await join(email, projectId, referrerCode);

      // Save to localStorage
      localStorage.setItem(
        'v-waitlist-user',
        JSON.stringify({ email, projectId, refCode: result.refCode })
      );

      setUserData(result);
      setState('success');
      onSuccess?.(result);
    } catch (err: any) {
      const errorMsg = err?.message || 'Something went wrong';
      setErrorMessage(errorMsg);
      setState('error');
      onError?.(errorMsg);
    }
  };

  const handleShare = (platform: 'twitter' | 'whatsapp' | 'copy') => {
    if (!userData) return;

    const text = `Just joined the waitlist! I'm #${userData.rank} in line. Join me!`;
    const url = window.location.origin + window.location.pathname + userData.shareUrl;

    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
      );
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
    }
  };

  // Inline styles (Shadow DOM compatible)
  const styles = getStyles(theme, primaryColor);

  if (mode === 'modal' && state === 'idle') {
    // Modal mode: show button that opens modal
    return (
      <div style={styles.container}>
        <button
          style={styles.openButton}
          onClick={() => (document.getElementById('vw-modal')?.classList.remove('vw-hidden'))}
        >
          Join Waitlist
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container} class={`v-waitlist v-waitlist-${theme}`}>
      {state === 'idle' || state === 'error' ? (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3 style={styles.title}>Join the Waitlist</h3>
          {state === 'error' && (
            <p style={styles.error}>{errorMessage}</p>
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            disabled={state === 'submitting'}
          />
          <button style={styles.button} type="submit" disabled={state === 'submitting'}>
            {state === 'submitting' ? 'Joining...' : 'Join Now'}
          </button>
        </form>
      ) : (
        <div style={styles.success}>
          <div style={styles.rankNumber}>#{userData?.rank || '-'}</div>
          <p style={styles.successText}>You're on the list!</p>
          <p style={styles.successSubtext}>
            {userData?.total && userData.rank
              ? `${userData.total - userData.rank} people are behind you`
              : ''}
          </p>
          <div style={styles.shareButtons}>
            <button style={{ ...styles.shareBtn, '--bg': '#1DA1F2' }} onClick={() => handleShare('twitter')}>
              Twitter
            </button>
            <button style={{ ...styles.shareBtn, '--bg': '#25D366' }} onClick={() => handleShare('whatsapp')}>
              WhatsApp
            </button>
            <button style={{ ...styles.shareBtn, '--bg': primaryColor }} onClick={() => handleShare('copy')}>
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
function getStyles(theme: Theme, primaryColor: string) {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1a1a1a' : '#ffffff';
  const text = isDark ? '#ffffff' : '#000000';
  const border = isDark ? '#333333' : '#e5e7eb';
  const inputBg = isDark ? '#2a2a2a' : '#f9fafb';

  return {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '400px',
      margin: '0 auto',
    },
    form: {
      padding: '24px',
      borderRadius: '12px',
      border: `1px solid ${border}`,
      backgroundColor: bg,
    },
    title: {
      margin: '0 0 16px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: text,
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: `1px solid ${border}`,
      backgroundColor: inputBg,
      color: text,
      fontSize: '14px',
      boxSizing: 'border-box' as const,
      marginBottom: '12px',
    },
    button: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: primaryColor,
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    error: {
      color: '#ef4444',
      fontSize: '14px',
      margin: '0 0 12px 0',
    },
    success: {
      padding: '24px',
      borderRadius: '12px',
      border: `1px solid ${border}`,
      backgroundColor: bg,
      textAlign: 'center' as const,
    },
    rankNumber: {
      fontSize: '48px',
      fontWeight: '700',
      color: primaryColor,
      margin: '0',
    },
    successText: {
      fontSize: '18px',
      fontWeight: '600',
      color: text,
      margin: '8px 0',
    },
    successSubtext: {
      fontSize: '14px',
      color: isDark ? '#999' : '#666',
      margin: '0 0 16px 0',
    },
    shareButtons: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
    },
    shareBtn: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      backgroundColor: 'var(--bg)',
    } as any,
    openButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: primaryColor,
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
  };
}
