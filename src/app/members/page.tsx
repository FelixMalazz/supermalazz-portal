import React from 'react';
import { Radio, Users, Headphones, ExternalLink, MessageSquare } from 'lucide-react';
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs shrink-0 p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="SuperMalazz Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 mb-1.5">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Discord Live Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Warga SuperMalazz
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              Direktori resmi warga tongkrongan yang terhubung langsung dengan Discord.
            </p>
          </div>
        </div>

        {/* Stats Pills & Discord Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-center min-w-[80px]">
            <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{totalCount}</div>
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Total Warga</div>
          </div>

          <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-center min-w-[80px]">
            <div className="text-xl font-extrabold text-emerald-600 leading-none">{onlineCount}</div>
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Online</div>
          </div>

          {voiceCount > 0 && (
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-center min-w-[80px]">
              <div className="text-xl font-extrabold text-[#E31B23] leading-none">{voiceCount}</div>
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Di Voice</div>
            </div>
          )}

          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Join Discord</span>
          </a>
        </div>
      </div>

      {/* Active Voice Channels Showcase (If Any) */}
      {activeChannels.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Headphones className="w-4 h-4 text-[#E31B23]" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Aktif di Voice Channel ({activeChannels.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChannels.map((vc) => (
              <div
                key={vc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      {vc.name}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {vc.occupants.length} Orang
                    </span>
                  </div>

                  {/* Avatars inside this VC */}
                  <div className="flex flex-wrap items-center gap-2 py-1">
                    {vc.occupants.map((occ) => (
                      <div
                        key={occ.id}
                        className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200"
                        title={occ.username}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={occ.avatar_url}
                          alt={occ.username}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="truncate max-w-[100px]">{occ.username}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <span>Masuk Voice</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Member Directory Grid */}
      <section>
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
