'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { calculateStockSummary } from '@/lib/storage';
import DarkModeToggle from './DarkModeToggle';

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/settings', label: '재고설정' },
  { href: '/records', label: '거래내역' },
  { href: '/product', label: '제품상세' },
  { href: '/upload', label: '업로드' },
  { href: '/export', label: '내보내기' },
  { href: '/charts', label: '시각화' },
  { href: '/guide', label: '가이드' },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [belowTarget, setBelowTarget] = useState(0);

  useEffect(() => {
    const load = async () => {
      const summary = await calculateStockSummary();
      const count = summary.filter((s) => s.gap < 0).length;
      setBelowTarget(count);
    };
    void load();
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 shrink-0 relative">
              재고관리
              {belowTarget > 0 && (
                <span className="absolute -top-1 -right-5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {belowTarget > 9 ? '9+' : belowTarget}
                </span>
              )}
            </Link>
            <div className="hidden md:flex ml-10 space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DarkModeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-blue-600"
              aria-label="메뉴 열기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
