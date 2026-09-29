import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  ExternalLink, 
  Headphones, 
  Sparkles, 
  Flame, 
  Crown, 
  Coffee, 
  Coins, 
  CalendarCheck, 
  MessageSquare, 
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { getAllGuildMembers } from '@/lib/discord';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const NOCTALY_LEADERBOARD_URL = 'https://noctaly.com/leaderboard/976042783443943464';

export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  const { members, channels, instant_invite } = await getAllGuildMembers();

  const inviteUrl = instant_invite || process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.com/invite/Vqm3qCAE';

  // Active voice members
  const voiceMembers = members.filter((m) => m.channel_id);
  const voiceCount = voiceMembers.length;

  return (
    <div className="min-h-screen bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-2 border-[#0A1128] dark:border-slate-700 mb-10">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl border-3 border-[#0A1128] dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-[4px_4px_0px_#0A1128] dark:shadow-[4px_4px_0px_#000000] shrink-0 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="SuperMalazz Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF3C7] dark:bg-amber-950/60 border-2 border-[#0A1128] dark:border-slate-700 rounded-lg text-xs font-black text-[#D97706] dark:text-amber-300 uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
              <Trophy className="w-3.5 h-3.5 text-[#D97706] dark:text-amber-400" />
              <span>Noctaly XP & Rank System</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#0A1128] dark:text-white tracking-tight">
              Leaderboard SuperMalazz
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1 max-w-2xl">
              Peringkat warga paling aktif, perolehan Chat & Voice XP, serta status kompetitif server yang ditenagai langsung oleh bot Noctaly.
            </p>
          </div>
        </div>

        {/* Live Voice Indicator Button */}
        <Link
          href="/members"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-[#0A1128] dark:border-slate-700 rounded-xl shadow-[3px_3px_0px_#0A1128] dark:shadow-[3px_3px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all self-start md:self-auto"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-black text-[#0A1128] dark:text-white">
            {voiceCount} Warga di Voice Room
          </span>
        </Link>
      </div>

      {/* 2. Hero Showcase Card (Noctaly Web Leaderboard CTA) */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-red-600 border-3 border-[#0A1128] dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_#0A1128] dark:shadow-[8px_8px_0px_#000000] text-white relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-wider border border-white/30 shadow-[2px_2px_0px_#0A1128]">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Peringkat Resmi Discord SuperMalazz</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Top 100 Warga Teraktif di Server
            </h2>

            <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-semibold">
              Bot Noctaly secara otomatis menghitung setiap pesan teks, durasi nongkrong di Voice Channel, serta aktivitas ekonomi di server SuperMalazz. Pantau posisi rank kamu di web resmi Noctaly!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={NOCTALY_LEADERBOARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#0A1128] font-black text-sm rounded-xl border-2 border-[#0A1128] shadow-[4px_4px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A1128] transition-all cursor-pointer group"
              >
                <span>Buka Leaderboard di Noctaly.com</span>
                <ExternalLink className="w-4 h-4 text-[#E31B23] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#0A1128]/40 hover:bg-[#0A1128]/60 text-white font-bold text-sm rounded-xl border-2 border-white/30 backdrop-blur-md transition-all"
              >
                <span>Masuk Discord untuk Cek /rank</span>
              </a>
            </div>
          </div>

          {/* Graphic / Highlight Badge */}
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-6 text-center space-y-3 shrink-0 self-center lg:self-auto min-w-[220px]">
            <div className="w-14 h-14 bg-white text-[#F59E0B] rounded-2xl flex items-center justify-center mx-auto border-2 border-[#0A1128] shadow-[3px_3px_0px_#0A1128]">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black">TOP 100</div>
              <div className="text-xs text-amber-200 font-bold uppercase tracking-wider">Live Web Sync</div>
            </div>
            <div className="text-[11px] text-white/80 font-medium border-t border-white/20 pt-2">
              Server ID: 976042783443943464
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Voice XP Champions */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#E31B23] dark:text-red-400 mb-1">
              <Headphones className="w-4 h-4" />
              <span>Voice XP Booster</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1128] dark:text-white tracking-tight">
              Warga Sedang Panen Voice XP
            </h2>
          </div>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Voice Channel otomatis memberikan XP per menit
          </span>
        </div>

        {voiceMembers.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 border-2 border-[#0A1128] dark:border-slate-700 rounded-2xl shadow-[4px_4px_0px_#0A1128] dark:shadow-[4px_4px_0px_#000000]">
            <Radio className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-black text-base text-[#0A1128] dark:text-white">Saat Ini Belum Ada Warga di Voice Room</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 font-semibold">
              Masuk ke salah satu voice channel di Discord SuperMalazz sekarang dan jadilah yang pertama kumpulkan Voice XP hari ini!
            </p>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black rounded-xl border-2 border-[#0A1128] dark:border-slate-700 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000] transition-all"
            >
              <span>Gabung Voice Room Sekarang</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {voiceMembers.map((m) => {
              const ch = channels.find((c) => c.id === m.channel_id);
              const channelName = ch ? ch.name : 'Voice Channel';

              return (
                <div
                  key={m.id}
                  className="bg-white dark:bg-slate-900 border-2 border-[#0A1128] dark:border-slate-700 rounded-2xl p-4 shadow-[4px_4px_0px_#0A1128] dark:shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.avatar_url}
                      alt={m.username}
                      className="w-10 h-10 rounded-xl border-2 border-[#0A1128] dark:border-slate-700 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#0A1128] dark:text-white truncate">
                        {m.nick || m.username}
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="truncate">{channelName}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-md text-[10px] font-black uppercase shrink-0">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span>+XP</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Command Cheatsheet Noctaly */}
      <section className="mb-14">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#D97706] dark:text-amber-400 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Panduan Interaksi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1128] dark:text-white tracking-tight">
            Command Bot Noctaly di Discord
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">
            Ketik command berikut di channel chat Discord SuperMalazz untuk mengecek status dan hadiah kamu:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Command 1: /rank */}
          <div className="bg-white dark:bg-slate-900 border-2 border-[#0A1128] dark:border-slate-700 rounded-2xl p-5 shadow-[4px_4px_0px_#0A1128] dark:shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/70 text-[#0A1128] dark:text-amber-300 border border-[#0A1128] dark:border-amber-700/60 rounded-lg text-xs font-black font-mono">
                /rank
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">XP Card</span>
            </div>
            <h3 className="text-sm font-black text-[#0A1128] dark:text-white mb-1">Cek Level & Rank Pribadi</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Menampilkan visual card berisi nomor peringkat server, level saat ini, progress XP bar, dan total pesan kamu.
            </p>
          </div>

          {/* Command 2: /leaderboard */}
          <div className="bg-white dark:bg-slate-900 border-2 border-[#0A1128] dark:border-slate-700 rounded-2xl p-5 shadow-[4px_4px_0px_#0A1128] dark:shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/70 text-[#E31B23] dark:text-rose-300 border border-[#0A1128] dark:border-rose-700/60 rounded-lg text-xs font-black font-mono">
                /leaderboard
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Top Server</span>
            </div>
            <h3 className="text-sm font-black text-[#0A1128] dark:text-white mb-1">Tampilkan Peringkat Teratas</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Memunculkan pesan embed di channel Discord berisi ranking top warga beserta tombol link langsung ke web leaderboard.
            </p>
          </div>

          {/* Command 3: /moneytop */}
          <div className="bg-white dark:bg-slate-900 border-2 border-[#0A1128] dark:border-slate-700 rounded-2xl p-5 shadow-[4px_4px_0px_#0A1128] dark:shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-[#0A1128] dark:border-emerald-700/60 rounded-lg text-xs font-black font-mono">
                /moneytop
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ekonomi</span>
            </div>
            <h3 className="text-sm font-black text-[#0A1128] dark:text-white mb-1">Peringkat Warga Terkaya</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Menampilkan daftar ranking member dengan jumlah koin dan saldo ekonomi terbanyak di server SuperMalazz.
            </p>
          </div>

          {/* Command 4: /daily */}
          <div className="bg-white dark:bg-slate-900 border-2 border-[#0A1128] dark:border-slate-700 rounded-2xl p-5 shadow-[4px_4px_0px_#0A1128] dark:shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-[#0A1128] dark:border-sky-700/60 rounded-lg text-xs font-black font-mono">
                /daily
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reward</span>
            </div>
            <h3 className="text-sm font-black text-[#0A1128] dark:text-white mb-1">Klaim Bonus Harian</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Klaim reward gratisan kamu setiap 24 jam sekali untuk menambah pundi koin dan bonus kemajuan XP.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Cara Naik Level & Syarat Role SIRKEL */}
      <section className="bg-white dark:bg-slate-900 border-3 border-[#0A1128] dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#0A1128] dark:shadow-[6px_6px_0px_#000000]">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-950/60 text-[#E31B23] dark:text-rose-300 border-2 border-[#0A1128] dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
            <Flame className="w-3.5 h-3.5 text-[#E31B23]" />
            <span>Target Warga</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1128] dark:text-white tracking-tight">
            Bagaimana Cara Cepat Naik Level & Role?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">
            Tingkatkan keaktifan kamu di server Discord SuperMalazz untuk membuka peluang dipromosikan ke role inti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300 rounded-xl flex items-center justify-center font-black border-2 border-[#0A1128] dark:border-slate-700 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
              1
            </div>
            <h3 className="font-black text-sm text-[#0A1128] dark:text-white">Nongkrong di Voice Channel</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Bot Noctaly menghitung XP pasif otomatis saat kamu ngobrol, nobar, atau main bareng di room voice.
            </p>
          </div>

          {/* Step 2 */}
          <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 bg-red-100 dark:bg-rose-950/60 text-[#E31B23] dark:text-rose-300 rounded-xl flex items-center justify-center font-black border-2 border-[#0A1128] dark:border-slate-700 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
              2
            </div>
            <h3 className="font-black text-sm text-[#0A1128] dark:text-white">Aktif Chat & Unggah Momen</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Ikut meramaikan obrolan di text channel Discord serta abadikan foto momen mabar di Galeri portal ini.
            </p>
          </div>

          {/* Step 3 */}
          <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center justify-center font-black border-2 border-[#0A1128] dark:border-slate-700 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
              3
            </div>
            <h3 className="font-black text-sm text-[#0A1128] dark:text-white">Promosi ke Role SIRKEL</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
              Warga yang konsisten aktif di leaderboard dan voice berhak dipromosikan dari MALAZZ menjadi <strong>SIRKEL</strong> oleh CHEF!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
