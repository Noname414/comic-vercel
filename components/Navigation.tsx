'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-4 right-4 z-40">
      <div className="flex space-x-2">
        {pathname === '/' ? (
          <Link
            href="/gallery"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-purple-600 px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center space-x-2 font-medium"
          >
            <span>🎨</span>
            <span>畫廊</span>
          </Link>
        ) : (
          <Link
            href="/"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-purple-600 px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center space-x-2 font-medium"
          >
            <span>🏠</span>
            <span>首頁</span>
          </Link>
        )}
      </div>
    </nav>
  );
}