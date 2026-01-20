import './globals.css';

export const metadata = {
  title: 'V-Waitlist - The Free Viral Waiting List',
  description: 'Open-source, serverless viral waiting list for indie hackers. Zero cost, 3 lines to integrate.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
