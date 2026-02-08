import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '재고관리 시스템',
  description: '프론트엔드 기반 재고관리 웹 애플리케이션',
};

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/settings', label: '재고설정' },
  { href: '/upload', label: '업로드' },
  { href: '/export', label: '내보내기' },
  { href: '/charts', label: '시각화' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={GeistSans.className}>
        <div className="min-h-screen flex flex-col">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-blue-600">
                    재고관리
                  </Link>
                  <div className="ml-10 flex space-x-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
            재고관리 시스템 &copy; {new Date().getFullYear()}
          </footer>
        </div>
      </body>
    </html>
  );
}
