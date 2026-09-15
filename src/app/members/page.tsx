import React from 'react';
import { Radio, Users, Headphones, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react';
import { getAllGuildMembers } from '@/lib/discord';
import { prisma } from '@/lib/prisma';
import MemberList from '@/components/MemberList';

export const revalidate = 30; // Refresh every 30 seconds

export default async function MembersPage() {
  const {
    members,
    totalCount,
    onlineCount,
    voiceCount,
    channels,
    instant_invite,
  } = await getAllGuildMembers();

  const inviteUrl = instant_invite || process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.com/invite/Vqm3qCAE';

  // Load registered users from database to supplement roles (CHEF, SIRKEL, MALAZZ)
  const roleMap: Record<string, string> = {};
  try {
    const dbUsers = await prisma.user.findMany({
      select: { id: true, username: true, role: true },
    });
    dbUsers.forEach((u) => {
      roleMap[u.id] = u.role;
      roleMap[u.username.toLowerCase()] = u.role;
    });
  } catch (err) {
    // ignore
  }

  // Find channels with active members
  const voiceMembers = members.filter((m) => m.channel_id);
  const activeChannelIds = Array.from(new Set(voiceMembers.map((m) => m.channel_id!)));

  const activeChannels = activeChannelIds.map((chId) => {
    const channelObj = channels.find((c) => c.id === chId);
    const occupants = voiceMembers.filter((m) => m.channel_id === chId);
    return {
      id: chId,
      name: channelObj?.name || 'Voice Room',
      occupants,
    };
  });

  return (
    <div className="min-h-screen bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-2 border-[#0A1128] mb-10">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl border-3 border-[#0A1128] overflow-hidden bg-white shadow-[4px_4px_0px_#0A1128] shrink-0 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="SuperMalazz Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 border-2 border-[#0A1128] rounded-lg text-xs font-black text-emerald-900 uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#0A1128]">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Live Discord Sync</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#0A1128] tracking-tight">
              Warga SuperMalazz
            </h1>
            <p className="text-sm text-slate-600 font-semibold mt-1">
              Direktori resmi seluruh warga tongkrongan ({totalCount} member) dengan sinkronisasi status live Discord.
            </p>
          </div>
        </div>

        {/* Stats Pills & Discord Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Total Warga Pill */}
          <div className="px-4 py-2 bg-white border-2 border-[#0A1128] rounded-xl shadow-[3px_3px_0px_#0A1128] text-center">
            <div className="text-2xl font-black text-[#0A1128] leading-none">{totalCount}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Total Warga</div>
          </div>

          {/* Online Warga Pill */}
          <div className="px-4 py-2 bg-white border-2 border-[#0A1128] rounded-xl shadow-[3px_3px_0px_#0A1128] text-center">
            <div className="text-2xl font-black text-emerald-600 leading-none">{onlineCount}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Online Aktif</div>
          </div>

          {/* Voice Pill */}
          {voiceCount > 0 && (
            <div className="px-4 py-2 bg-white border-2 border-[#0A1128] rounded-xl shadow-[3px_3px_0px_#0A1128] text-center">
              <div className="text-2xl font-black text-[#E31B23] leading-none">{voiceCount}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Di Voice</div>
            </div>
          )}

          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#0A1128] shadow-[3px_3px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Nongkrong Bareng</span>
          </a>
        </div>
      </div>

      {/* Active Voice Channels Showcase (If Any) */}
      {activeChannels.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="w-5 h-5 text-[#E31B23]" />
            <h2 className="font-black text-lg text-[#0A1128]">
              Sedang Ngobrol di Voice Channel Sekarang
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChannels.map((vc) => (
              <div
                key={vc.id}
                className="bg-[#0A1128] text-white border-2 border-[#0A1128] rounded-2xl p-5 shadow-[5px_5px_0px_#E31B23] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-black text-sm text-[#F59E0B] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      {vc.name}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold rounded text-slate-300 border border-slate-700">
                      {vc.occupants.length} Orang
                    </span>
                  </div>

                  {/* Avatars inside this VC */}
                  <div className="flex flex-wrap items-center gap-2 py-2">
                    {vc.occupants.map((occ) => (
                      <div
                        key={occ.id}
                        className="flex items-center gap-2 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold"
                        title={occ.username}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={occ.avatar_url}
                          alt={occ.username}
                          className="w-5 h-5 rounded-full object-cover border border-slate-500"
                        />
                        <span className="text-slate-200">{occ.username}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-800">
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2 bg-[#E31B23] hover:bg-[#c41219] text-white text-xs font-black uppercase rounded-lg border border-white shadow-[2px_2px_0px_white] transition-all"
                  >
                    <span>Masuk Voice Channel Ini</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Member Directory Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#0A1128]" />
          <h2 className="font-black text-lg text-[#0A1128]">
            Direktori Warga SuperMalazz ({totalCount})
          </h2>
        </div>

        <MemberList
          members={members}
          channels={channels}
          inviteUrl={inviteUrl}
          roleMap={roleMap}
        />
      </section>

    </div>
  );
}
