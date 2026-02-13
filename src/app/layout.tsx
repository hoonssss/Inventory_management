import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import NavBar from '@/components/NavBar';
import './globals.css';

const siteName = '재관분 | 재고관리분석 웹';
const siteDescription =
  '재관분은 구매대행, 사입, 사입재고, 물류재고, 카페재고까지 한 번에 관리·분석하는 재고관리분석 웹 서비스입니다.';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: '%s | 재관분',
  },
  description: siteDescription,
  applicationName: '재관분',
  keywords: [
    '재관분',
    '재고관리분석',
    '재고관리 웹',
    '구매대행',
    '구매대행 재고',
    '사입',
    '사입재고',
    '사입관리',
    '물류재고',
    '카페재고',
    '쇼핑몰 재고관리',
    '스마트스토어 재고관리',
    '물류사업',
    '유통사업',
    '재고관리',
    '재고파악',
    '재고분석',
    '재고관리엑셀',
    '재고엑셀',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: '재관분',
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: '1HXN1G0ZGXioNS41SLHPyElexC_46Lh1NyaMYt4uaew',
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
            재관분(재고관리분석 웹) &copy; {new Date().getFullYear()}
          </footer>
        </div>
      </body>
    </html>
  );
}
