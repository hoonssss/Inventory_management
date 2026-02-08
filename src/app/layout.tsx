import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import NavBar from '@/components/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: '재고관리 시스템',
  description:
    '물류사업, 유통사업, 재고관리, 재고파악, 재고분석, 사입관리까지 지원하는 프론트엔드 기반 재고관리 웹 애플리케이션',
  keywords: [
    '물류사업',
    '유통사업',
    '재고관리',
    '재고파악',
    '재고분석',
    '사입관리',
    '재고관리엑셀',
    '재고엑셀',
    '재고분석',
  ],
  verification: {
    google: 'ioKFLSQ8pbPobMGfmI9BAQ-2nU837hNXOHWS30neCYM',
    other: {
      'naver-site-verification': '89dae5c739b0b23c7643b2f0f52ee9bb094a41ba',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={GeistSans.className}>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
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
