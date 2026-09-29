import React from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Sparkles, 
  Coffee, 
  ArrowRight, 
  ExternalLink, 
  Check, 
  Pin,
  Headphones,
  Camera,
  Heart,
  Volume2,
  ShieldAlert,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { getAnnouncements } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { getAllGuildMembers } from '@/lib/discord';
import { getMoments } from '@/lib/gallery';

export const revalidate = 30; // Refresh every 30 seconds

const CORE_RULES = [
  {
    no: '01',
    title: 'Respek & Anti SARA',
    desc: 'Hormati sesama member. Dilarang ujaran kebencian, pelecehan, dan isu SARA dalam bentuk apapun.',
    tag: 'Toleransi',
    color: 'border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
  },
  {
    no: '02',
    title: 'Bebas Konten NSFW',
    desc: 'Dilarang keras menyebarkan materi pornografi, gambar/video vulgar, maupun konten 18+ di seluruh channel.',
    tag: 'Safe Community',
    color: 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30',
  },
  {
    no: '03',
    title: 'Anti Scam & Phising',
    desc: 'Dilarang membagikan link penipuan, transaksi mencurigakan, atau jual-beli akun ilegal.',
    tag: 'Keamanan',
    color: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
  },
  {
    no: '04',
    title: 'No Drama & Anti Toxic',
    desc: 'Server ini tempat bersantai. Hindari memicu keributan atau membawa masalah pribadi ke ruang publik.',
    tag: 'Stay Chill',
    color: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
  },
  {
    no: '05',
    title: 'Anti Spam & Flood',
    desc: 'Hindari spam pesan berulang, flood stiker, bot command di channel umum, atau reaksi emoji berlebihan.',
    tag: 'Ketertiban',
    color: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
  },
  {
    no: '06',
    title: 'Fair Play & No Cheat',
    desc: 'Junjung sportivitas saat mabar. Dilarang menggunakan cheat, exploit bug ilegal, atau merugikan sesama pemain.',
    tag: 'Sportivitas',
    color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const { announcements } = await getAnnouncements();
  const pinnedAnnouncement = announcements.find((a) => a.isPinned) || announcements[0];
  
  const { totalCount, onlineCount, members, voiceCount, instant_invite } = await getAllGuildMembers();
  const inviteUrl = instant_invite || process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.com/invite/Vqm3qCAE';
  const voiceMembers = members.filter((m) => m.channel_id);

  const moments = await getMoments();
  const topMoments = moments.slice(0, 3);

  return (
    <div className="min-h-screen bg-grid-pattern pb-20 selection:bg-[#E31B23] selection:text-white">
      
      {/* 1. HERO SECTION (Clean, elevated, less text clutter) */}
      <section className="relative pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        {/* Logo Badge */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 shadow-lg group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="SuperMalazz Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Live Server Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-full shadow-xs mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Link
            href="/members"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#E31B23] transition-colors"
          >
            Server Aktif &bull; <strong className="text-slate-900 dark:text-white font-bold">{totalCount} Warga</strong> ({onlineCount} Online)
          </Link>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0A1128] dark:text-white tracking-tight leading-[1.15] mb-5">
          Komunitas Discord Resmi <br className="hidden sm:inline" />
          <span className="text-[#E31B23]">SuperMalazz</span>
        </h1>

        {/* Concise Description */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Tempat kumpul, mabar game, dokumentasi galeri momen seru, dan obrolan santai warga tongkrongan.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#E31B23] hover:bg-[#c41219] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <span>Gabung Discord</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <Link
            href="/galeri"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all"
          >
            <Camera className="w-4 h-4 text-[#E31B23]" />
            <span>Lihat Galeri</span>
          </Link>
        </div>

        {/* User Status Bar if logged in */}
        {user && (
          <div className="mt-8 inline-flex items-center gap-2.5 px-4 py-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-xs">
            <span>Halo, <strong className="text-slate-900 dark:text-white">{user.displayName || user.username}</strong></span>
            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
            <span className="font-bold text-[#E31B23] uppercase tracking-wider">{user.role}</span>
          </div>
        )}
      </section>

      {/* 2. LIVE VOICE ACTIVITY (Compact & refined) */}
      {voiceMembers.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                  Live Voice Channel
                </span>
              </div>

              <Link
                href="/members"
                className="text-xs font-semibold text-slate-500 hover:text-[#E31B23] dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua ({voiceMembers.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {voiceMembers.slice(0, 10).map((vm) => (
                <div
                  key={vm.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vm.avatar_url}
                    alt={vm.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{vm.username}</span>
                  <Headphones className="w-3 h-3 text-emerald-500 ml-0.5" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. PINNED ANNOUNCEMENT (Clean spotlight card) */}
      {pinnedAnnouncement && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-amber-50/50 dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs relative">
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F59E0B] text-[#0A1128] text-[11px] font-bold uppercase rounded-md">
                  <Pin className="w-3 h-3" />
                  Pengumuman
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Oleh <strong className="text-slate-700 dark:text-slate-300">{pinnedAnnouncement.author.displayName || pinnedAnnouncement.author.username}</strong>
                </span>
              </div>

              <span className="text-xs text-slate-400">
                {new Date(pinnedAnnouncement.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
              {pinnedAnnouncement.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
              {pinnedAnnouncement.content}
            </p>

            <Link
              href="/pengumuman"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#E31B23] hover:underline"
            >
              <span>Baca Selengkapnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 4. MOMEN HIGHLIGHT (Modern 3-column grid) */}
      {topMoments.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Galeri Momen Tongkrongan
              </h2>
            </div>

            <Link
              href="/galeri"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#E31B23] dark:hover:text-white transition-colors"
            >
              <span>Buka Galeri Lengkap ({moments.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topMoments.map((mom) => (
              <Link
                key={mom.id}
                href="/galeri"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mom.imageUrl}
                      alt={mom.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#0A1128]/85 text-white text-[10px] font-bold uppercase rounded-md backdrop-blur-xs">
                      {mom.category}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#E31B23] transition-colors line-clamp-1 mb-1">
                      {mom.title}
                    </h3>
                    {mom.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {mom.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-medium truncate">{mom.author.displayName || mom.author.username}</span>
                  <span className="flex items-center gap-1 text-[#E31B23] font-bold">
                    <Heart className="w-3.5 h-3.5 fill-[#E31B23]" />
                    {mom.reactions?.find(r => r.emoji === '❤️')?.count ?? mom.likes}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. ROLE HIERARCHY (Clean, professional, text-streamlined) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#E31B23] uppercase tracking-wider mb-2 block">
            Struktur Komunitas
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Peran & Hak Akses Warga
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CHEF CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center mb-4 text-[#D97706] dark:text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">CHEF</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300 rounded-full uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Pemilik dan moderator utama server. Mengatur tata kelola komunitas, moderasi, serta menyematkan pengumuman resmi.
              </p>
            </div>

            <ul className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#F59E0B]" />
                <span>Kontrol Penuh Server & Moderasi</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#F59E0B]" />
                <span>Publikasi & Sematan Pengumuman</span>
              </li>
            </ul>
          </div>

          {/* SIRKEL CARD */}
          <div className="bg-white dark:bg-slate-900 border-2 border-[#E31B23]/40 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative">
            <div>
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 rounded-xl flex items-center justify-center mb-4 text-[#E31B23]">
                <Flame className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">SIRKEL</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-[#E31B23] rounded-full uppercase">
                  Host Mabar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Member reguler aktif dan inisiator mabar. Sering meramaikan voice channel dan mengabadikan momen di galeri.
              </p>
            </div>

            <ul className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#E31B23]" />
                <span>Inisiator Mabar & Voice Channel</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#E31B23]" />
                <span>Unggah Foto & Momen Galeri</span>
              </li>
            </ul>
          </div>

          {/* MALAZZ CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-slate-600 dark:text-slate-300">
                <Coffee className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">MALAZZ</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full uppercase">
                  Member
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                Warga komunitas santai. Bebas bergabung di voice channel, membaca pengumuman, dan meramaikan reaksi galeri.
              </p>
            </div>

            <ul className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-400" />
                <span>Akses Bebas ke Voice & Chat Room</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-400" />
                <span>Beri Komentar & Reaksi Momen</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 6. SERVER RULES (Concise, streamlined 6 cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#E31B23] uppercase tracking-wider mb-2 block">
            Aturan Komunitas
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tata Tertib SuperMalazz
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {CORE_RULES.map((rule) => (
            <div
              key={rule.no}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    #{rule.no}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${rule.color}`}>
                    {rule.tag}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
                  {rule.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Enforcement Note */}
        <div className="mt-8 max-w-3xl mx-auto text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pelanggaran terhadap tata tertib di atas akan ditindak dengan sanksi bertingkat (Warn, Mute, hingga Ban) oleh pengurus server.
          </p>
        </div>
      </section>

    </div>
  );
}
