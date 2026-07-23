import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import AppShell from '@/components/AppShell';
import './globals.css';

// SST (Sony's UI typeface) is a commercial Monotype font that can't be
// bundled here — the CSS font stack prefers a locally-installed SST and
// falls back to Source Sans 3, the closest freely-licensable match to
// SST's Frutiger-style humanist letterforms. To use real SST, drop
// licensed .woff2 files into the project and add an @font-face for 'SST'.
const sstFallback = Source_Sans_3({
  variable: '--font-sst-fallback',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Ryne Zhu',
  description:
    'Ryne Zhu — Computer Engineering student and full-stack developer. Portfolio styled after the PlayStation home menu.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sstFallback.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text-primary font-display">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
