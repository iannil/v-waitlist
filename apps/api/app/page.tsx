export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>V-Waitlist API</h1>
      <p>Open-source viral waiting list API</p>
      <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
        {`Endpoints:
POST /api/join    - Join the waitlist
GET  /api/status  - Check your rank
GET  /api/export  - Export data (admin)`}
      </pre>
    </main>
  );
}
