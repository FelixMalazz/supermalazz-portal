import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import ToastContainer from '@/components/Toast';
import { getCurrentUser } from '@/lib/auth';
import { getDiscordWidget } from '@/lib/discord';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'SuperMalazz | Official Community Portal & Tongkrongan',
  description:
    'Platform terpadu komunitas tongkrongan online SuperMalazz. Portal Discord, info hirarki peran CHEF, SIRKEL, MALAZZ, dan pengumuman komunitas.',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const widget = await getDiscordWidget();
  const onlineCount = widget?.presence_count || 60;

  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0A1128] font-sans">
        <Navbar user={user} onlineCount={onlineCount} />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <ToastContainer />
      </body>
    </html>
  );
}
