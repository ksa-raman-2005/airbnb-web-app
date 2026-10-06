import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Airbnb | Vacation rentals, cabins, beach houses & more',
  description: 'Find vacation rentals, cabins, beach houses, unique homes and experiences around the world - all made possible by hosts on Airbnb.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col antialiased bg-white text-neutral-900">
        <UserProvider>
          <ToastProvider>
            <Suspense fallback={<div className="h-20 border-b border-neutral-200 bg-white" />}>
              <Header />
            </Suspense>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
