export default function HomePage() {
  return (
    <main style={styles.main}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>V-Waitlist</div>
        <nav style={styles.nav}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#demo" style={styles.navLink}>Demo</a>
          <a href="https://github.com/yourname/v-waitlist" style={styles.navLink}>GitHub</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>Open Source & Free Forever</div>
          <h1 style={styles.heroTitle}>
            The Free Viral Waiting List{' '}
            <span style={styles.gradient}>for Indie Hackers</span>
          </h1>
          <p style={styles.heroDescription}>
            Build viral waiting lists with referral systems, leaderboards, and social sharing.
            Zero cost. 3 lines to integrate. You own the data.
          </p>
          <div style={styles.heroButtons}>
            <a href="#demo" style={styles.primaryButton}>See Demo</a>
            <a href="https://github.com/yourname/v-waitlist" style={styles.secondaryButton}>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.features}>
        <h2 style={styles.sectionTitle}>Why V-Waitlist?</h2>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💰</div>
            <h3 style={styles.featureTitle}>100% Free</h3>
            <p style={styles.featureDesc}>
              Uses free tiers of Vercel and Upstash Redis. No credit card required.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Lightning Fast</h3>
            <p style={styles.featureDesc}>
              Edge Functions + Redis. Response times under 100ms globally.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔒</div>
            <h3 style={styles.featureTitle}>You Own Data</h3>
            <p style={styles.featureDesc}>
              Data stored in your own Redis instance. Export anytime.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🚀</div>
            <h3 style={styles.featureTitle}>3-Line Setup</h3>
            <p style={styles.featureDesc}>
              Drop in a script tag, add the custom element. Done.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🎯</div>
            <h3 style={styles.featureTitle}>Viral by Design</h3>
            <p style={styles.featureDesc}>
              Built-in referrals, leaderboards, and social sharing.
            </p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🛡️</div>
            <h3 style={styles.featureTitle}>Anti-Abuse</h3>
            <p style={styles.featureDesc}>
              Cloudflare Turnstile, rate limiting, disposable email blocking.
            </p>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" style={styles.demo}>
        <h2 style={styles.sectionTitle}>Live Demo</h2>
        <p style={styles.demoDesc}>
          Try the widget below. This is the same widget you'll use on your site.
        </p>
        <div style={styles.demoWidget}>
          {/* This would be the actual widget in production */}
          <div style={styles.widgetPlaceholder}>
            <div style={styles.widgetPlaceholderInner}>
              <p style={styles.widgetPlaceholderText}>
                🎉 <strong>v-waitlist</strong> widget loads here
              </p>
              <code style={styles.code}>
                &lt;v-waitlist project-id="demo"&gt;&lt;/v-waitlist&gt;
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section style={styles.codeSection}>
        <h2 style={styles.sectionTitle}>3 Lines to Integrate</h2>
        <div style={styles.codeBlock}>
          <pre style={styles.pre}>
            <code style={styles.code}>
{`<script src="https://cdn.v-waitlist.com/sdk.js"></script>
<v-waitlist project-id="your-project-id"></v-waitlist>`}
            </code>
          </pre>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to Launch?</h2>
        <p style={styles.ctaDesc}>
          Get started for free. Deploy to Vercel in one click.
        </p>
        <a href="https://vercel.com/new/clone?repository-url=https://github.com/yourname/v-waitlist" style={styles.ctaButton}>
          <img
            src="https://vercel.com/button"
            alt="Deploy with Vercel"
            style={styles.vercelButton}
          />
        </a>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Built with Next.js · Upstash Redis · Preact · Cloudflare
        </p>
        <p style={styles.footerText}>
          MIT License · Open Source
        </p>
      </footer>
    </main>
  );
}

// Styles
const styles = {
  main: {
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    gap: '24px',
  } as const,
  navLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '14px',
  },
  hero: {
    padding: '80px 20px',
    textAlign: 'center' as const,
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: '1.1',
    margin: '0 0 20px 0',
  },
  gradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroDescription: {
    fontSize: '18px',
    color: '#666',
    lineHeight: '1.6',
    margin: '0 0 32px 0',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  primaryButton: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  secondaryButton: {
    padding: '14px 32px',
    background: '#f3f4f6',
    color: '#374151',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
  },
  features: {
    padding: '80px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    textAlign: 'center' as const,
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 48px 0',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    padding: '32px',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  featureIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  featureDesc: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    margin: '0',
  },
  demo: {
    padding: '80px 20px',
    background: '#f9fafb',
  },
  demoDesc: {
    textAlign: 'center' as const,
    color: '#666',
    margin: '0 0 32px 0',
  },
  demoWidget: {
    maxWidth: '400px',
    margin: '0 auto',
  },
  widgetPlaceholder: {
    padding: '60px 20px',
    background: '#fff',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb',
  },
  widgetPlaceholderInner: {
    textAlign: 'center' as const,
  },
  widgetPlaceholderText: {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 16px 0',
  },
  codeSection: {
    padding: '80px 20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  codeBlock: {
    background: '#1f2937',
    borderRadius: '8px',
    padding: '24px',
    overflow: 'auto',
  },
  pre: {
    margin: '0',
  },
  code: {
    color: '#e5e7eb',
    fontSize: '14px',
  },
  cta: {
    padding: '80px 20px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
  },
  ctaTitle: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 16px 0',
  },
  ctaDesc: {
    fontSize: '18px',
    margin: '0 0 32px 0',
    opacity: 0.9,
  },
  ctaButton: {
    display: 'inline-block',
  },
  vercelButton: {
    height: '40px',
  },
  footer: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    borderTop: '1px solid #e5e7eb',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    margin: '8px 0',
  },
};
