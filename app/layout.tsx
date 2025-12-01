export const metadata = {
  title: 'Free Music Streaming - Unlimited Access',
  description: 'Stream unlimited music for free. No ads, no limits, completely legal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}