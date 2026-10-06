import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto text-neutral-600 text-xs">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-8 md:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-neutral-200">
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm mb-3">Support</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="hover:underline">Help Center</Link></li>
              <li><Link href="/" className="hover:underline">AirCover</Link></li>
              <li><Link href="/" className="hover:underline">Anti-discrimination</Link></li>
              <li><Link href="/" className="hover:underline">Disability support</Link></li>
              <li><Link href="/" className="hover:underline">Cancellation options</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm mb-3">Hosting</h4>
            <ul className="space-y-2.5">
              <li><Link href="/host/create" className="hover:underline">Airbnb your home</Link></li>
              <li><Link href="/host" className="hover:underline">AirCover for Hosts</Link></li>
              <li><Link href="/host" className="hover:underline">Hosting resources</Link></li>
              <li><Link href="/host" className="hover:underline">Community forum</Link></li>
              <li><Link href="/host" className="hover:underline">Hosting responsibly</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm mb-3">Airbnb</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="hover:underline">Newsroom</Link></li>
              <li><Link href="/" className="hover:underline">New features</Link></li>
              <li><Link href="/" className="hover:underline">Careers</Link></li>
              <li><Link href="/" className="hover:underline">Investors</Link></li>
              <li><Link href="/" className="hover:underline">Gift cards</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm mb-3">Airbnb Clone Demo</h4>
            <p className="text-neutral-500 leading-relaxed mb-3">
              Built with Next.js (TypeScript), FastAPI (Python), and SQLite for the SDE Fullstack Assignment.
            </p>
            <div className="flex items-center gap-2 font-medium text-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All core browse & booking systems active
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span>© 2026 Airbnb, Inc. · Clone Implementation</span>
            <span className="hidden sm:inline">·</span>
            <Link href="/" className="hover:underline">Privacy</Link>
            <span className="hidden sm:inline">·</span>
            <Link href="/" className="hover:underline">Terms</Link>
            <span className="hidden sm:inline">·</span>
            <Link href="/" className="hover:underline">Sitemap</Link>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 font-semibold hover:underline">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </button>
            <button className="font-semibold hover:underline">
              $ USD
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
