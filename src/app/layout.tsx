import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Age & Gender Detection',
  description: 'Advanced machine learning application for detecting age and gender from facial images using TensorFlow.js',
  keywords: 'AI, machine learning, age detection, gender classification, TensorFlow.js, computer vision',
  authors: [{ name: 'AI Vision Lab' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'AI Age & Gender Detection',
    description: 'Advanced machine learning application for detecting age and gender from facial images',
    type: 'website',
    siteName: 'AI Vision Lab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Age & Gender Detection',
    description: 'Advanced machine learning application for detecting age and gender from facial images',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className="antialiased bg-gray-50 min-h-screen"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}