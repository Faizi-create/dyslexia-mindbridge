import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dyslexia MindBridge — Admin',
  description: 'Admin dashboard for Dyslexia MindBridge',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
