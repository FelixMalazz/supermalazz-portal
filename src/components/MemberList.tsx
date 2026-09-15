'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Gamepad2,
  Users,
  Headphones,
  Table as TableIcon,
  LayoutGrid,
  X,
  Crown,
  Flame,
  Coffee,
  ArrowUpDown,
  Radio,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Shield,
} from 'lucide-react';
import { DiscordWidgetMember, DiscordWidgetChannel } from '@/lib/discord';
import { showToast } from '@/components/Toast';

interface MemberListProps {
  members: DiscordWidgetMember[];
  channels: DiscordWidgetChannel[];
  inviteUrl: string;
  roleMap?: Record<string, string>;
}

type FilterType = 'ALL' | 'ONLINE' | 'VOICE' | 'GAMING' | 'STAFF' | 'IDLE' | 'OFFLINE';
type SortType = 'DEFAULT' | 'NAME_ASC' | 'NAME_DESC';

export default function MemberList({
  members,
  channels,
  inviteUrl,
  roleMap = {},
}: MemberListProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [sortBy, setSortBy] = useState<SortType>('DEFAULT');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'ALL'>(60);
  const [selectedMember, setSelectedMember] = useState<DiscordWidgetMember | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    showToast('ID Discord berhasil disalin ke clipboard! 📋');
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Map channel names
  const channelMap = useMemo(() => {
    const map = new Map<string, string>();
    channels.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [channels]);

  // Helper to determine member role
  const getMemberRole = (member: DiscordWidgetMember): string => {
    if (member.role) return member.role;
    if (roleMap[member.id]) return roleMap[member.id];
    if (roleMap[`dc-${member.id}`]) return roleMap[`dc-${member.id}`];
    if (roleMap[member.username.toLowerCase()]) return roleMap[member.username.toLowerCase()];
    return 'MALAZZ';
  };

  // Reset pagination when search, filter, sort, or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, sortBy, pageSize]);

  // Filter and Search Logic
  const filteredMembers = useMemo(() => {
    let result = members.filter((m) => {
      const channelName = m.channel_id ? channelMap.get(m.channel_id) || '' : '';
      const gameName = m.game?.name || '';
      const role = getMemberRole(m);

      // Multi-criteria search (Username, Game Title, Voice Channel Name)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = m.username.toLowerCase().includes(q);
        const matchGame = gameName.toLowerCase().includes(q);
        const matchChannel = channelName.toLowerCase().includes(q);
        if (!matchName && !matchGame && !matchChannel) return false;
      }

      // Filter tabs
      if (filter === 'ONLINE') return m.status === 'online';
      if (filter === 'VOICE') return Boolean(m.channel_id);
      if (filter === 'GAMING') return Boolean(m.game);
      if (filter === 'STAFF') return role === 'CHEF' || role === 'SIRKEL';
      if (filter === 'IDLE') return m.status === 'idle' || m.status === 'dnd';
      if (filter === 'OFFLINE') return m.status === 'offline';

      return true;
    });

    // Sorting Logic
    return result.sort((a, b) => {
      if (sortBy === 'NAME_ASC') {
        return a.username.localeCompare(b.username);
      }
      if (sortBy === 'NAME_DESC') {
        return b.username.localeCompare(a.username);
      }

      // Default: Voice channel first, then game playing, then online, then idle, then CHEF/SIRKEL, then name
      const aVoice = Boolean(a.channel_id);
      const bVoice = Boolean(b.channel_id);
      if (aVoice && !bVoice) return -1;
      if (!aVoice && bVoice) return 1;

      const aGame = Boolean(a.game);
      const bGame = Boolean(b.game);
      if (aGame && !bGame) return -1;
      if (!aGame && bGame) return 1;

      const aOnline = a.status !== 'offline';
      const bOnline = b.status !== 'offline';
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;

      if (a.status === 'online' && b.status !== 'online') return -1;
      if (a.status !== 'online' && b.status === 'online') return 1;

      const roleWeight = (r?: string) => (r === 'CHEF' ? 3 : r === 'SIRKEL' ? 2 : 1);
      const diff = roleWeight(getMemberRole(b)) - roleWeight(getMemberRole(a));
      if (diff !== 0) return diff;

      return a.username.localeCompare(b.username);
    });
  }, [members, search, filter, sortBy, channelMap, roleMap]);

  // Counts for tabs
  const counts = useMemo(() => {
    const total = members.length;
    const online = members.filter((m) => m.status === 'online').length;
    const voice = members.filter((m) => m.channel_id).length;
    const gaming = members.filter((m) => m.game).length;
    const staff = members.filter((m) => {
      const r = getMemberRole(m);
      return r === 'CHEF' || r === 'SIRKEL';
    }).length;
    const idle = members.filter((m) => m.status === 'idle' || m.status === 'dnd').length;
    const offline = members.filter((m) => m.status === 'offline').length;

    return { total, online, voice, gaming, staff, idle, offline };
  }, [members, roleMap]);

  // Pagination calculations
  const totalPages = pageSize === 'ALL' ? 1 : Math.ceil(filteredMembers.length / (typeof pageSize === 'number' ? pageSize : 60));
  const paginatedMembers = useMemo(() => {
    if (pageSize === 'ALL') return filteredMembers;
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Role Badge Component
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'CHEF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FEF3C7] text-[#D97706] border border-[#0A1128] rounded-md text-[10px] font-black uppercase shadow-[1px_1px_0px_#0A1128]">
            <Crown className="w-3 h-3 text-[#D97706]" />
            <span>CHEF</span>
          </span>
        );
      case 'SIRKEL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-[#E31B23] border border-[#0A1128] rounded-md text-[10px] font-black uppercase shadow-[1px_1px_0px_#0A1128]">
            <Flame className="w-3 h-3 text-[#E31B23]" />
            <span>SIRKEL</span>
          </span>
        );
      case 'MALAZZ':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-[10px] font-black uppercase">
            <Coffee className="w-3 h-3 text-slate-500" />
            <span>MALAZZ</span>
          </span>
        );
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status: 'online' | 'idle' | 'dnd' | 'offline') => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0A1128]"></span>
            <span>Online</span>
          </span>
        );
      case 'idle':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#0A1128]"></span>
            <span>AFK / Idle</span>
          </span>
        );
      case 'dnd':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-[#0A1128]"></span>
            <span>Jangan Ganggu</span>
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400"></span>
            <span>Offline</span>
          </span>
        );
    }
  };

  return (
    <div>
      {/* Control Panel: Search, Filter Tabs & View Switcher */}
      <div className="bg-white border-2 border-[#0A1128] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#0A1128] mb-8 space-y-4">
        
        {/* Row 1: Search Bar + Sort + View Switcher */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Multi-Criteria Search Input (Opsi 2) */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama warga, judul game (e.g. Valorant, Roblox), atau nama voice room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border-2 border-[#0A1128] rounded-xl text-xs sm:text-sm font-bold text-[#0A1128] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#E31B23] shadow-[2px_2px_0px_#0A1128] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Sorting Dropdown & View Mode Switcher (Opsi 1) */}
          <div className="flex items-center gap-2.5 justify-end">
            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="appearance-none pl-8 pr-7 py-2 bg-slate-50 hover:bg-slate-100 border-2 border-[#0A1128] rounded-xl text-xs font-black text-[#0A1128] shadow-[2px_2px_0px_#0A1128] cursor-pointer focus:outline-hidden"
              >
                <option value="DEFAULT">Urutan Prioritas (Voice & Game)</option>
                <option value="NAME_ASC">Nama (A - Z)</option>
                <option value="NAME_DESC">Nama (Z - A)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Switcher Toggle (Opsi 1) */}
            <div className="flex items-center bg-slate-100 border-2 border-[#0A1128] rounded-xl p-0.5 shadow-[2px_2px_0px_#0A1128]">
              <button
                onClick={() => setViewMode('table')}
                title="Tampilan Tabel"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#0A1128] text-white shadow-[1px_1px_0px_#0A1128]'
                    : 'text-slate-600 hover:text-[#0A1128]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Tampilan Grid Kartu"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#0A1128] text-white shadow-[1px_1px_0px_#0A1128]'
                    : 'text-slate-600 hover:text-[#0A1128]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>

        </div>

        {/* Row 2: Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {/* Semua */}
          <button
            onClick={() => setFilter('ALL')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'ALL'
                ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-[2px_2px_0px_#E31B23]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span>Semua Warga</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                filter === 'ALL' ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.total}
            </span>
          </button>

          {/* Online Aktif */}
          <button
            onClick={() => setFilter('ONLINE')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'ONLINE'
                ? 'bg-emerald-100 text-emerald-900 border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Online Aktif</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                filter === 'ONLINE' ? 'bg-[#0A1128] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.online}
            </span>
          </button>

          {/* Di Voice */}
          <button
            onClick={() => setFilter('VOICE')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'VOICE'
                ? 'bg-[#5865F2] text-white border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Di Voice Channel</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                filter === 'VOICE' ? 'bg-white text-[#5865F2]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.voice}
            </span>
          </button>

          {/* Sedang Main Game */}
          <button
            onClick={() => setFilter('GAMING')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'GAMING'
                ? 'bg-[#F59E0B] text-[#0A1128] border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Sedang Main Game</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                filter === 'GAMING' ? 'bg-[#0A1128] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.gaming}
            </span>
          </button>

          {/* Staff / Inti */}
          <button
            onClick={() => setFilter('STAFF')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'STAFF'
                ? 'bg-rose-100 text-rose-800 border-[#0A1128] shadow-[2px_2px_0px_#0A1128] ring-1 ring-[#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Pengurus / Inti</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                filter === 'STAFF' ? 'bg-[#0A1128] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.staff}
            </span>
          </button>

          {/* AFK / Idle */}
          <button
            onClick={() => setFilter('IDLE')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'IDLE'
                ? 'bg-amber-100 text-amber-900 border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>AFK / Idle</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                filter === 'IDLE' ? 'bg-[#0A1128] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.idle}
            </span>
          </button>

          {/* Offline */}
          <button
            onClick={() => setFilter('OFFLINE')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'OFFLINE'
                ? 'bg-slate-200 text-slate-900 border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-500 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Offline</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                filter === 'OFFLINE' ? 'bg-[#0A1128] text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {counts.offline}
            </span>
          </button>
        </div>

      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border-2 border-[#0A1128] rounded-2xl shadow-[4px_4px_0px_#0A1128]">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-black text-lg text-[#0A1128]">Tidak Ada Warga Ditemukan</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 font-medium">
            {search || filter !== 'ALL'
              ? 'Tidak ada warga yang sesuai dengan kata kunci atau filter saat ini.'
              : 'Belum ada warga yang terdeteksi online.'}
          </p>
          {(search || filter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setFilter('ALL');
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0A1128] text-xs font-black rounded-xl border-2 border-[#0A1128] shadow-[2px_2px_0px_#0A1128] transition-all cursor-pointer"
            >
              Reset Filter & Pencarian
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* ======================================================== */
        /* OPTION 1: NEO-BRUTALISM DATA TABLE VIEW                  */
        /* ======================================================== */
        <div className="bg-white border-2 border-[#0A1128] rounded-2xl shadow-[5px_5px_0px_#0A1128] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Table Header */}
              <thead>
                <tr className="bg-[#0A1128] text-white text-xs font-black uppercase tracking-wider border-b-2 border-[#0A1128]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Warga Discord</th>
                  <th className="py-3.5 px-4">Peran (Role)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Aktivitas / Game</th>
                  <th className="py-3.5 px-4">Voice Channel</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y-2 divide-slate-100 text-xs">
                {paginatedMembers.map((m, idx) => {
                  const channelName = m.channel_id ? channelMap.get(m.channel_id) : null;
                  const role = getMemberRole(m);
                  const absoluteIdx = pageSize === 'ALL' ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="hover:bg-amber-50/70 transition-colors group cursor-pointer"
                      title="Klik untuk melihat profil detail"
                    >
                      {/* 1. Index */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {absoluteIdx}
                      </td>

                      {/* 2. Member: Avatar + Status Dot + Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl border-2 border-[#0A1128] overflow-hidden bg-slate-100 shadow-[2px_2px_0px_#0A1128]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.avatar_url}
                                alt={m.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Status Dot */}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                m.status === 'online'
                                  ? 'bg-emerald-500'
                                  : m.status === 'idle'
                                  ? 'bg-amber-400'
                                  : m.status === 'dnd'
                                  ? 'bg-rose-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="font-black text-sm text-[#0A1128] group-hover:text-[#E31B23] transition-colors truncate">
                              {m.username}
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold truncate">
                              ID: {m.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 3. Role */}
                      <td className="py-3.5 px-4">
                        {renderRoleBadge(role)}
                      </td>

                      {/* 4. Status */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(m.status)}
                      </td>

                      {/* 5. Game Activity */}
                      <td className="py-3.5 px-4">
                        {m.game ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg text-xs font-black text-[#E31B23]">
                            <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[180px]">{m.game.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-semibold italic text-[11px]">
                            {m.status === 'offline' ? 'Sedang Offline' : 'Santai di Server'}
                          </span>
                        )}
                      </td>

                      {/* 6. Voice Channel */}
                      <td className="py-3.5 px-4">
                        {channelName ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border-2 border-indigo-300 rounded-lg text-xs font-black text-indigo-800 shadow-[1px_1px_0px_#0A1128]">
                            <Headphones className="w-3.5 h-3.5 text-indigo-600 animate-pulse shrink-0" />
                            <span className="truncate max-w-[160px]">{channelName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Info */}
          <div className="px-5 py-3.5 bg-slate-50 border-t-2 border-[#0A1128] flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-500">
            <div>
              Menampilkan <span className="font-black text-[#0A1128]">{paginatedMembers.length}</span> dari{' '}
              <span className="font-black text-[#0A1128]">{filteredMembers.length}</span> warga terfilter ({members.length} total warga)
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Data otomatis tersinkronisasi via Discord Bot & Widget</span>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* GRID CARDS VIEW                                          */
        /* ======================================================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedMembers.map((m) => {
            const channelName = m.channel_id ? channelMap.get(m.channel_id) : null;
            const role = getMemberRole(m);

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className="bg-white border-2 border-[#0A1128] rounded-2xl p-4 shadow-[4px_4px_0px_#0A1128] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0A1128] transition-all flex flex-col justify-between cursor-pointer group"
                title="Klik untuk melihat profil detail"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    {/* Avatar + Status Indicator */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl border-2 border-[#0A1128] overflow-hidden bg-slate-100 shadow-[2px_2px_0px_#0A1128]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.avatar_url}
                          alt={m.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Status Dot */}
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          m.status === 'online'
                            ? 'bg-emerald-500'
                            : m.status === 'idle'
                            ? 'bg-amber-400'
                            : m.status === 'dnd'
                            ? 'bg-rose-500'
                            : 'bg-slate-300'
                        }`}
                        title={`Status: ${m.status}`}
                      />
                    </div>

                    {/* Name & Details */}
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="font-black text-sm text-[#0A1128] truncate">
                          {m.username}
                        </h4>
                        <div>{renderRoleBadge(role)}</div>
                      </div>

                      {/* Game Activity */}
                      {m.game ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#E31B23] mt-0.5 truncate">
                          <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{m.game.name}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          {m.status === 'online'
                            ? 'Santai di Server'
                            : m.status === 'idle'
                            ? 'Lagi AFK'
                            : m.status === 'dnd'
                            ? 'Jangan Ganggu'
                            : 'Sedang Offline'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voice Channel Pill */}
                  {channelName && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border-2 border-indigo-300 rounded-lg text-[11px] font-black text-indigo-800 shadow-[1px_1px_0px_#0A1128] w-full">
                      <Headphones className="w-3.5 h-3.5 text-indigo-600 animate-pulse shrink-0" />
                      <span className="truncate">{channelName}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div>{renderStatusBadge(m.status)}</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Warga Discord</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredMembers.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-2 border-[#0A1128] rounded-2xl p-4 shadow-[4px_4px_0px_#0A1128]">
          <div className="text-xs font-bold text-slate-600">
            Menampilkan{' '}
            <span className="font-black text-[#0A1128]">
              {pageSize === 'ALL'
                ? 1
                : Math.min((currentPage - 1) * (typeof pageSize === 'number' ? pageSize : 60) + 1, filteredMembers.length)}
            </span>{' '}
            -{' '}
            <span className="font-black text-[#0A1128]">
              {pageSize === 'ALL'
                ? filteredMembers.length
                : Math.min(currentPage * (typeof pageSize === 'number' ? pageSize : 60), filteredMembers.length)}
            </span>{' '}
            dari <span className="font-black text-[#0A1128]">{filteredMembers.length}</span> warga
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mr-2">
              <span className="hidden sm:inline">Per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                  setPageSize(val);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border-2 border-[#0A1128] rounded-lg text-xs font-black text-[#0A1128] shadow-[1px_1px_0px_#0A1128] cursor-pointer"
              >
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={100}>100</option>
                <option value="ALL">Semua</option>
              </select>
            </div>

            {/* Navigation Buttons */}
            {pageSize !== 'ALL' && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border-2 border-[#0A1128] bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-[1px_1px_0px_#0A1128] cursor-pointer transition-all"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 text-[#0A1128]" />
                </button>

                {/* Page numbers with smart ellipsis */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | string)[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === 'string' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-bold text-xs">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${item}`}
                          onClick={() => setCurrentPage(item)}
                          className={`w-8 h-8 rounded-lg border-2 text-xs font-black transition-all cursor-pointer ${
                            currentPage === item
                              ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-[2px_2px_0px_#E31B23]'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border-2 border-[#0A1128] bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-[1px_1px_0px_#0A1128] cursor-pointer transition-all"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4 text-[#0A1128]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Profile Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white border-3 border-[#0A1128] rounded-3xl max-w-md w-full shadow-[8px_8px_0px_#0A1128] overflow-hidden animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner with Role Theme */}
            <div
              className={`px-6 py-4 border-b-3 border-[#0A1128] flex items-center justify-between ${
                getMemberRole(selectedMember) === 'CHEF'
                  ? 'bg-[#FEF3C7]'
                  : getMemberRole(selectedMember) === 'SIRKEL'
                  ? 'bg-red-100'
                  : 'bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0A1128]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#0A1128]">
                  Profil Warga SuperMalazz
                </span>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg border-2 border-[#0A1128] bg-white hover:bg-slate-100 text-[#0A1128] shadow-[2px_2px_0px_#0A1128] cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Avatar + Main Info */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl border-3 border-[#0A1128] overflow-hidden bg-slate-100 shadow-[4px_4px_0px_#0A1128]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedMember.avatar_url}
                      alt={selectedMember.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                      selectedMember.status === 'online'
                        ? 'bg-emerald-500'
                        : selectedMember.status === 'idle'
                        ? 'bg-amber-400'
                        : selectedMember.status === 'dnd'
                        ? 'bg-rose-500'
                        : 'bg-slate-300'
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-xl text-[#0A1128] truncate leading-tight mb-0.5">
                    {selectedMember.username}
                  </h3>
                  {selectedMember.global_name && selectedMember.global_name !== selectedMember.username && (
                    <div className="text-xs font-bold text-slate-500 truncate mb-1">
                      {selectedMember.global_name}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {renderRoleBadge(getMemberRole(selectedMember))}
                    {renderStatusBadge(selectedMember.status)}
                  </div>
                </div>
              </div>

              {/* ID Discord Container with 1-Click Copy */}
              <div className="bg-slate-50 border-2 border-[#0A1128] rounded-2xl p-3.5 flex items-center justify-between shadow-[2px_2px_0px_#0A1128]">
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Discord User ID</div>
                  <div className="font-mono text-xs font-black text-[#0A1128]">{selectedMember.id}</div>
                </div>
                <button
                  onClick={(e) => handleCopyId(selectedMember.id, e)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border-2 border-[#0A1128] rounded-xl text-xs font-black text-[#0A1128] shadow-[2px_2px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all cursor-pointer"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? 'Tersalin' : 'Salin ID'}</span>
                </button>
              </div>

              {/* Activity Info: Game / Voice Channel */}
              <div className="space-y-2.5">
                {/* Voice Channel */}
                {selectedMember.channel_id && (
                  <div className="p-3 bg-indigo-50 border-2 border-indigo-300 rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#0A1128]">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-indigo-600 animate-pulse" />
                      <div>
                        <div className="text-[10px] font-black text-indigo-500 uppercase">Voice Room</div>
                        <div className="text-xs font-black text-indigo-900">
                          {channelMap.get(selectedMember.channel_id) || 'Voice Room'}
                        </div>
                      </div>
                    </div>
                    <a
                      href={inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-black uppercase flex items-center gap-1 shadow-xs"
                    >
                      <span>Masuk VC</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Game Activity */}
                {selectedMember.game && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2.5 shadow-[2px_2px_0px_#0A1128]">
                    <Gamepad2 className="w-4 h-4 text-[#E31B23]" />
                    <div>
                      <div className="text-[10px] font-black text-red-500 uppercase">Sedang Bermain</div>
                      <div className="text-xs font-black text-[#E31B23]">{selectedMember.game.name}</div>
                    </div>
                  </div>
                )}

                {/* Joined At Date */}
                {selectedMember.joined_at && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 px-1 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Bergabung di server:{' '}
                      <strong className="text-[#0A1128]">
                        {new Date(selectedMember.joined_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <a
                  href={`https://discord.com/users/${selectedMember.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#0A1128] shadow-[3px_3px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Profil di Discord</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
