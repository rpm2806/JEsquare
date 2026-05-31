import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'JEE JEsquare - AI-Powered Test Generation Platform',
  description:
    'Create, manage, and analyze JEE-style tests with AI-powered question generation, CBT exam interface, and comprehensive analytics.',
  keywords: ['JEE', 'test generation', 'AI', 'exam', 'CBT', 'analytics', 'education'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
