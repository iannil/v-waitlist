export const metadata = {
  title: 'V-Waitlist API',
  description: 'The open-source viral waiting list API',
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
