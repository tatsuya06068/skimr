import './globals.css';
import type { Metadata } from 'next';
import { PostHogProvider } from '../components/PostHogProvider';

export const metadata: Metadata = {
  title: 'Front Next',
  description: 'Next.js app for skimr',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
