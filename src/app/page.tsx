import React from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Sparkles, 
  Coffee, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Pin,
  Headphones,
  Camera,
  Heart,
  Volume2,
  ShieldAlert
} from 'lucide-react';
import { getAnnouncements } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import { getAllGuildMembers } from '@/lib/discord';
import { getMoments } from '@/lib/gallery';

export const revalidate = 30; // Refresh every 30 seconds

const COMMUNITY_RULES = [
  {
    no: '01',
    title: 'Dilarang Badword, Rasis & SARA',
    desc: 'Dilarang menggunakan kata-kata yang mengandung badword kasar berlebihan, penghinaan rasis, dan isu SARA yang merendahkan siapapun.',
    tag: 'Toleransi & Respek',
    badgeClass: 'bg-red-100 text-[#E31B23]',
  },
  {
    no: '02',
    title: 'Dilarang Membagi Konten 🔞 NSFW',
    desc: 'Dilarang membagikan konten pornografi, vulgar, 18+ NSFW, maupun gambar/video tidak senonoh di seluruh ruang server.',
    tag: 'Strict No NSFW',
    badgeClass: 'bg-rose-100 text-rose-700',
  },
  {
    no: '03',
    title: 'Dilarang Melakukan Penipuan atau Scam',
    desc: 'Dilarang melakukan penipuan, penyebaran link scam, phising, jual-beli akun ilegal, atau transaksi mencurigakan.',
    tag: 'Anti Scam',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  {
    no: '04',
    title: 'Dilarang Caper Berlebihan',
    desc: 'Santai dan berbaur secara wajar. Hindari sikap mencari perhatian berlebihan atau memancing kegaduhan yang merusak suasana.',
    tag: 'Stay Chill',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
  {
    no: '05',
    title: 'Dilarang Memicu Drama & Kerusuhan',
    desc: 'Server ini tempat nongkrong santai. Dilarang memicu keributan, provokasi, atau membawa pertikaian pribadi ke ranah publik.',
    tag: 'No Drama Zone',
    badgeClass: 'bg-orange-100 text-orange-700',
  },
  {
    no: '06',
    title: 'Dilarang Spam Chat, Stiker & Emoji',
    desc: 'Dilarang flood chat, spam stiker, GIF, atau reaksi emoji berulang-ulang yang mengotori alur obrolan dan mengganggu member.',
    tag: 'Anti Spam',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  {
    no: '07',
    title: 'Gunakan Badword Sewajarnya',
    desc: 'Bercanda tongkrongan boleh asik dan receh, tapi tetap gunakan kata umpatan sewajarnya dan jangan jadikan senjata toxic.',
    tag: 'Batas Bercanda',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    no: '08',
    title: 'Dilarang X-RAY & Cheat Lainnya',
    desc: 'Junjung sportivitas saat mabar. Dilarang keras menggunakan X-RAY, cheat, bot ilegal, atau kecurangan apapun di game server.',
    tag: 'Fair Play',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  {
    no: '09',
    title: 'Dilarang Menggunakan BUG Ilegal',
    desc: 'Dilarang mengeksploitasi bug sistem server game, bot, maupun celah aplikasi untuk keuntungan sepihak yang merusak game.',
    tag: 'No Exploit',
    badgeClass: 'bg-slate-200 text-slate-800',
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
    <div className="min-h-screen bg-grid-pattern pb-24 selection:bg-[#E31B23] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          
          {/* Logo Showcase with Badge */}
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            <div className="relative group">
              {/* Outer decorative neo shadow box */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white border-3 border-[#0A1128] p-3 shadow-[8px_8px_0px_#0A1128] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-[4px_4px_0px_#0A1128] transition-all overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="SuperMalazz Official Logo"
                  className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Floating Badge on Logo */}
              <div className="absolute -bottom-2 -right-3 px-3 py-1 bg-[#F59E0B] text-[#0A1128] text-[10px] font-black uppercase rounded-lg border-2 border-[#0A1128] shadow-[2px_2px_0px_#0A1128] rotate-2">
                Official Server
              </div>
            </div>
          </div>

          {/* Live Status Pill with extra vertical margin */}
          <div className="flex items-center justify-center pt-1 mb-6">
            <Link
              href="/members"
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white hover:bg-emerald-50 border-2 border-[#0A1128] rounded-full shadow-[3px_3px_0px_#0A1128] hover:shadow-[1px_1px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 transition-all group"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-[#0A1128]">
                Server Online &bull; <span className="text-[#E31B23]">{totalCount} Warga</span> ({onlineCount} Online)
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0A1128] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          {/* Headline Utama */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0A1128] tracking-tight leading-[1.08]">
            Bukan Sekadar Discord, Ini{' '}
            <span className="inline-block bg-[#E31B23] text-white px-4 py-0.5 rounded-2xl border-3 border-[#0A1128] shadow-[5px_5px_0px_#0A1128] -rotate-1 hover:rotate-0 transition-transform">
              Rumah Kedua
            </span>{' '}
            Lo.
          </h1>

          {/* Subheadline / Deskripsi with higher contrast */}
          <p className="text-base sm:text-lg text-slate-700 font-medium max-w-2xl mx-auto leading-relaxed">
            Portal resmi komunitas <strong className="text-[#0A1128] font-bold">SuperMalazz</strong>. Sinkronisasi role otomatis, galeri momen mabar, dan tempat nongkrong virtual tanpa drama.
          </p>

          {/* Action CTAs (Side by side flex row) */}
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 bg-[#E31B23] hover:bg-[#c41219] text-white text-sm sm:text-base font-black uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              <span>Gabung Discord</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              href="/galeri"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 bg-white hover:bg-slate-50 text-black text-sm sm:text-base font-black uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              <Camera className="w-4 h-4 text-[#E31B23]" />
              <span>Jelajahi Galeri</span>
            </Link>
          </div>

          {/* User Welcome Pill */}
          {user && (
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-[#0A1128] rounded-xl text-xs font-bold text-[#0A1128] shadow-[2px_2px_0px_#0A1128]">
                👋 Selamat datang kembali, <strong className="text-[#E31B23]">{user.displayName || user.username}</strong>! Role: <span className="font-black px-1.5 py-0.5 bg-slate-100 rounded border border-[#0A1128]">{user.role}</span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2. LIVE VOICE ACTIVITY SECTION */}
      {voiceMembers.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-[#0A1128] text-white border-3 border-[#0A1128] rounded-3xl p-6 sm:p-7 shadow-[8px_8px_0px_#E31B23] relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <span className="font-black text-sm uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Live Voice Channel Tongkrongan Saat Ini
                </span>
              </div>

              <Link
                href="/members"
                className="text-xs font-black text-slate-300 hover:text-white uppercase tracking-wider flex items-center gap-1.5 hover:underline"
              >
                <span>Lihat Semua ({voiceMembers.length} Orang)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {voiceMembers.slice(0, 10).map((vm) => (
                <div
                  key={vm.id}
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-800/95 border-2 border-slate-700 rounded-xl hover:border-emerald-400 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vm.avatar_url}
                    alt={vm.username}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-100 leading-none">{vm.username}</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                      <Headphones className="w-3 h-3 animate-pulse" />
                      In Voice
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. PINNED POST ANNOUNCEMENT */}
      {pinnedAnnouncement && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-[#FFFBEB] border-3 border-[#0A1128] rounded-3xl p-6 sm:p-7 shadow-[6px_6px_0px_#0A1128] relative overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F59E0B] text-[#0A1128] text-xs font-black uppercase rounded-xl border-2 border-[#0A1128] shadow-[2px_2px_0px_#0A1128]">
                  <Pin className="w-3.5 h-3.5" />
                  Pengumuman Resmi
                </span>
                <span className="text-xs font-black text-slate-500">
                  Oleh {pinnedAnnouncement.author.displayName || pinnedAnnouncement.author.username} ({pinnedAnnouncement.author.role})
                </span>
              </div>

              <span className="text-xs font-bold text-slate-500">
                {new Date(pinnedAnnouncement.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0A1128] mb-2 leading-snug">
              {pinnedAnnouncement.title}
            </h3>

            <p className="text-sm sm:text-base text-slate-700 line-clamp-2 leading-relaxed mb-4 font-medium">
              {pinnedAnnouncement.content}
            </p>

            <Link
              href="/pengumuman"
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#E31B23] hover:text-[#c41219] uppercase tracking-wider underline underline-offset-4"
            >
              <span>Baca Selengkapnya di Portal Pengumuman</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 4. GALERI & MOMEN HIGHLIGHT */}
      {topMoments.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border-2 border-[#0A1128] rounded-lg text-xs font-black text-[#E31B23] uppercase tracking-wider mb-2">
                <Camera className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Kenangan Tongkrongan</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0A1128] tracking-tight">
                Galeri Momen SuperMalazz
              </h2>
            </div>

            <Link
              href="/galeri"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A1128] hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider border-2 border-[#0A1128] shadow-[4px_4px_0px_#E31B23] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#E31B23] transition-all"
            >
              <span>Lihat Semua Galeri ({moments.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topMoments.map((mom) => (
              <Link
                key={mom.id}
                href="/galeri"
                className="bg-white border-3 border-[#0A1128] rounded-3xl overflow-hidden shadow-[6px_6px_0px_#0A1128] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#E31B23] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border-b-3 border-[#0A1128]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mom.imageUrl}
                      alt={mom.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#0A1128] text-white text-[10px] font-black uppercase rounded-lg border-2 border-white shadow-[2px_2px_0px_#0A1128]">
                      {mom.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-black text-lg text-[#0A1128] group-hover:text-[#E31B23] transition-colors line-clamp-1 mb-2 leading-snug">
                      {mom.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-semibold line-clamp-2 leading-relaxed">
                      {mom.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <span className="font-extrabold text-slate-700 truncate">{mom.author.displayName || mom.author.username}</span>
                  <span className="flex items-center gap-1.5 text-[#E31B23] font-black px-2.5 py-1 bg-red-50 rounded-lg border border-red-200">
                    <Heart className="w-3.5 h-3.5 fill-[#E31B23]" />
                    {mom.likes}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. ROLE HIERARCHY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black tracking-widest text-[#E31B23] uppercase bg-red-50 border-2 border-red-200 px-3 py-1 rounded-full">
            Discord RBAC Matrix
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0A1128] tracking-tight">
            Hirarki & Peran Warga
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-semibold">
            Status peran yang otomatis disinkronisasi langsung dari server Discord SuperMalazz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CHEF CARD */}
          <div className="bg-white border-3 border-[#0A1128] rounded-3xl p-7 shadow-[7px_7px_0px_#0A1128] hover:-translate-y-1 hover:shadow-[9px_9px_0px_#F59E0B] transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#F59E0B] text-[#0A1128] font-black text-[11px] uppercase px-4 py-1.5 border-b-2 border-l-2 border-[#0A1128] rounded-bl-2xl tracking-wider shadow-sm">
              Tier 1 Puncak
            </div>

            <div>
              <div className="w-16 h-16 bg-[#FEF3C7] border-3 border-[#0A1128] rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#0A1128]">
                <Sparkles className="w-8 h-8 text-[#D97706]" />
              </div>
              <h3 className="text-3xl font-black text-[#0A1128] mb-1">CHEF</h3>
              <p className="text-xs font-black text-[#D97706] uppercase tracking-wider mb-4">
                The Masterminds & Founder
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-semibold">
                Penjaga ketertiban dan pengarah visi komunitas. Memiliki kontrol penuh atas server, broadcast pengumuman resmi (*Mini CMS*), serta tata kelola server.
              </p>
            </div>

            <div className="border-t-2 border-slate-100 pt-5 space-y-2.5 text-xs font-black text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>Publish & Pin Pengumuman Resmi (CMS)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>Akses Penuh Moderasi & Konfigurasi Server</span>
              </div>
            </div>
          </div>

          {/* SIRKEL CARD */}
          <div className="bg-white border-3 border-[#0A1128] rounded-3xl p-7 shadow-[7px_7px_0px_#E31B23] hover:-translate-y-1 hover:shadow-[9px_9px_0px_#E31B23] transition-all flex flex-col justify-between relative overflow-hidden ring-3 ring-[#E31B23]">
            <div className="absolute top-0 right-0 bg-[#E31B23] text-white font-black text-[11px] uppercase px-4 py-1.5 border-b-2 border-l-2 border-[#0A1128] rounded-bl-2xl tracking-wider shadow-sm">
              Tier 2 Inti
            </div>

            <div>
              <div className="w-16 h-16 bg-red-50 border-3 border-[#0A1128] rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#0A1128]">
                <Flame className="w-8 h-8 text-[#E31B23]" />
              </div>
              <h3 className="text-3xl font-black text-[#0A1128] mb-1">SIRKEL</h3>
              <p className="text-xs font-black text-[#E31B23] uppercase tracking-wider mb-4">
                The Homies & Mabar Host
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-semibold">
                Member reguler aktif dan inisiator keseruan. Mereka yang sering ngajak nongkrong, meramaikan voice channel, dan mengabadikan momen seru di galeri.
              </p>
            </div>

            <div className="border-t-2 border-slate-100 pt-5 space-y-2.5 text-xs font-black text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E31B23] shrink-0" />
                <span>Ajak Mabar di Discord & Unggah Momen</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E31B23] shrink-0" />
                <span>Akses Eksklusif Room Voice & Event Internal</span>
              </div>
            </div>
          </div>

          {/* MALAZZ CARD */}
          <div className="bg-white border-3 border-[#0A1128] rounded-3xl p-7 shadow-[7px_7px_0px_#0A1128] hover:-translate-y-1 hover:shadow-[9px_9px_0px_#64748B] transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-200 text-[#0A1128] font-black text-[11px] uppercase px-4 py-1.5 border-b-2 border-l-2 border-[#0A1128] rounded-bl-2xl tracking-wider shadow-sm">
              Tier 3 Umum
            </div>

            <div>
              <div className="w-16 h-16 bg-slate-100 border-3 border-[#0A1128] rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#0A1128]">
                <Coffee className="w-8 h-8 text-[#64748B]" />
              </div>
              <h3 className="text-3xl font-black text-[#0A1128] mb-1">MALAZZ</h3>
              <p className="text-xs font-black text-[#64748B] uppercase tracking-wider mb-4">
                The Chillers & Enjoyers
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-semibold">
                Basis massa santai. Bebas mampir kapan saja, membaca pengumuman publik, ikutan nimbrung ngobrol di voice channel, dan meramaikan galeri.
              </p>
            </div>

            <div className="border-t-2 border-slate-100 pt-5 space-y-2.5 text-xs font-black text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Akses Publik Semua Halaman Portal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Bebas Nimbrung Mabar & Kasih Like di Galeri</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. TONGKRONGAN RULES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-100 border-2 border-[#0A1128] rounded-full text-xs font-black text-[#E31B23] uppercase tracking-wider shadow-[2px_2px_0px_#0A1128]">
            <ShieldAlert className="w-4 h-4 text-[#E31B23]" />
            <span>Kode Etik & Regulasi Server</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0A1128] tracking-tight">
            9 Aturan Server SuperMalazz
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-semibold max-w-xl mx-auto">
            Demi kenyamanan dan ketertiban bersama di server Discord maupun saat mabar, seluruh warga wajib menaati 9 aturan utama berikut.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {COMMUNITY_RULES.map((rule) => (
            <div
              key={rule.no}
              className="bg-white border-3 border-[#0A1128] rounded-3xl p-6 shadow-[5px_5px_0px_#0A1128] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#E31B23] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-50 border-2 border-[#0A1128] rounded-2xl flex items-center justify-center font-black text-base text-[#E31B23] shadow-[2px_2px_0px_#0A1128] group-hover:bg-[#E31B23] group-hover:text-white transition-colors">
                    {rule.no}
                  </div>
                  <span className={`px-2.5 py-1 border border-[#0A1128] rounded-lg text-[10px] font-black uppercase tracking-wider ${rule.badgeClass}`}>
                    {rule.tag}
                  </span>
                </div>

                <h3 className="font-black text-lg text-[#0A1128] mb-2 leading-snug group-hover:text-[#E31B23] transition-colors">
                  {rule.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                  {rule.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-[#E31B23]"></span>
                  Aturan Wajib Server
                </span>
                <span className="text-[10px] font-black uppercase text-[#0A1128] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">
                  Rule {rule.no}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Notice & Enforcement Box */}
        <div className="mt-12 max-w-4xl mx-auto p-5 sm:p-6 bg-[#FFFBEB] border-3 border-[#0A1128] rounded-3xl shadow-[5px_5px_0px_#0A1128] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] border-2 border-[#0A1128] flex items-center justify-center text-xl shrink-0 shadow-[3px_3px_0px_#0A1128]">
              ⚠️
            </div>
            <div>
              <h4 className="text-base font-black text-[#0A1128]">Sanksi Pelanggaran Regulasi</h4>
              <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5 leading-relaxed">
                Pelanggaran terhadap 9 aturan di atas akan ditindak dengan sanksi bertingkat: <strong>Warn</strong>, <strong>Timeout / Mute</strong>, <strong>Kick</strong>, hingga <strong>Ban Permanen</strong> oleh CHEF & tim pengurus.
              </p>
            </div>
          </div>
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0A1128] hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#0A1128] shadow-[3px_3px_0px_#E31B23] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#E31B23] shrink-0 transition-all"
          >
            <span>Buka Discord</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

    </div>
  );
}
