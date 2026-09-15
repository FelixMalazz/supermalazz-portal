export interface DiscordWidgetMember {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  avatar_url: string;
  game?: {
    name: string;
  };
  channel_id?: string;
  deaf?: boolean;
  mute?: boolean;
  self_deaf?: boolean;
  self_mute?: boolean;
  role?: string;
  roles?: string[];
  joined_at?: string;
  nick?: string | null;
  global_name?: string | null;
}

export interface DiscordWidgetChannel {
  id: string;
  name: string;
  position: number;
}

export interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string;
  channels: DiscordWidgetChannel[];
  members: DiscordWidgetMember[];
  presence_count: number;
}

export async function getDiscordWidget(): Promise<DiscordWidgetData | null> {
  const guildId = process.env.DISCORD_GUILD_ID || '976042783443943464';

  try {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      next: { revalidate: 15 }, // Cache for 15 seconds
    });

    if (!res.ok) {
      console.error(`Failed to fetch Discord widget: ${res.status}`);
      return null;
    }

    const data: DiscordWidgetData = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching Discord widget:', error);
    return null;
  }
}

export async function getAllGuildMembers(): Promise<{
  members: DiscordWidgetMember[];
  totalCount: number;
  onlineCount: number;
  voiceCount: number;
  channels: DiscordWidgetChannel[];
  instant_invite: string;
}> {
  const guildId = process.env.DISCORD_GUILD_ID || '976042783443943464';
  const botToken = process.env.DISCORD_BOT_TOKEN;

  // 1. Fetch live widget data (presence, voice channels, games)
  const widget = await getDiscordWidget();
  const widgetMembers = widget?.members || [];
  const channels = widget?.channels || [];
  const presenceCount = widget?.presence_count || widgetMembers.length;
  const instant_invite = widget?.instant_invite || process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.com/invite/Vqm3qCAE';

  // If no bot token, return widget members directly
  if (!botToken) {
    return {
      members: widgetMembers,
      totalCount: presenceCount,
      onlineCount: presenceCount,
      voiceCount: widgetMembers.filter((m) => m.channel_id).length,
      channels,
      instant_invite,
    };
  }

  try {
    // 2. Fetch all members via Discord Bot API (up to 1000 members)
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!res.ok) {
      console.error(`Discord Bot API returned ${res.status}:`, await res.text());
      return {
        members: widgetMembers,
        totalCount: presenceCount,
        onlineCount: presenceCount,
        voiceCount: widgetMembers.filter((m) => m.channel_id).length,
        channels,
        instant_invite,
      };
    }

    const botMembers: any[] = await res.json();

    // Create a lookup map for live widget members (keyed by lowercase username/nickname)
    const widgetMap = new Map<string, DiscordWidgetMember>();
    widgetMembers.forEach((m) => {
      if (m.username) {
        widgetMap.set(m.username.toLowerCase(), m);
      }
    });

    // Helper to find live widget presence for a member by checking nick, username, and global_name
    const findLivePresence = (bm: any): DiscordWidgetMember | undefined => {
      const nick = bm.nick?.toLowerCase();
      const username = bm.user?.username?.toLowerCase();
      const globalName = bm.user?.global_name?.toLowerCase();

      // 1. Direct exact match with server nickname, Discord handle, or display name
      if (nick && widgetMap.has(nick)) return widgetMap.get(nick);
      if (username && widgetMap.has(username)) return widgetMap.get(username);
      if (globalName && widgetMap.has(globalName)) return widgetMap.get(globalName);

      // 2. Prefix match for names truncated with '...' by Discord widget
      for (const wm of widgetMembers) {
        const wName = wm.username.toLowerCase();
        if (wName.endsWith('...')) {
          const prefix = wName.slice(0, -3);
          if (prefix.length >= 2) {
            if (nick?.startsWith(prefix) || username?.startsWith(prefix) || globalName?.startsWith(prefix)) {
              return wm;
            }
          }
        }
      }

      return undefined;
    };

    const chefRoleId = process.env.DISCORD_ROLE_CHEF_ID || '1146093007729348629';
    const sirkelRoleId = process.env.DISCORD_ROLE_SIRKEL_ID || '1030705472120041473';

    // Map all members
    const allMembers: DiscordWidgetMember[] = botMembers
      .filter((bm) => !bm.user?.bot) // Filter out bots so only genuine human members are shown
      .map((bm) => {
        const u = bm.user;
        const liveWidgetMember = findLivePresence(bm);

        // Avatar url
        let avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
        if (bm.avatar) {
          avatar_url = `https://cdn.discordapp.com/guilds/${guildId}/users/${u.id}/avatars/${bm.avatar}.png?size=128`;
        } else if (u.avatar) {
          avatar_url = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`;
        } else if (liveWidgetMember?.avatar_url) {
          avatar_url = liveWidgetMember.avatar_url;
        } else {
          try {
            const defaultIdx = Number((BigInt(u.id) >> BigInt(22)) % BigInt(6));
            avatar_url = `https://cdn.discordapp.com/embed/avatars/${defaultIdx}.png`;
          } catch {
            avatar_url = 'https://cdn.discordapp.com/embed/avatars/0.png';
          }
        }

        // Determine role from Discord role IDs
        let role = 'MALAZZ';
        const userRoles: string[] = bm.roles || [];
        if (userRoles.includes(chefRoleId)) {
          role = 'CHEF';
        } else if (userRoles.includes(sirkelRoleId)) {
          role = 'SIRKEL';
        }

        return {
          id: u.id,
          username: bm.nick || u.global_name || u.username,
          discriminator: u.discriminator || '0',
          avatar: u.avatar,
          avatar_url,
          status: liveWidgetMember?.status || 'offline',
          game: liveWidgetMember?.game,
          channel_id: liveWidgetMember?.channel_id,
          deaf: liveWidgetMember?.deaf || bm.deaf,
          mute: liveWidgetMember?.mute || bm.mute,
          self_deaf: liveWidgetMember?.self_deaf,
          self_mute: liveWidgetMember?.self_mute,
          roles: bm.roles,
          role,
          joined_at: bm.joined_at,
          nick: bm.nick,
          global_name: u.global_name,
        };
      });

    // Sort: Online/Voice/Game first, then CHEF/SIRKEL, then alphabetical
    const sortedMembers = allMembers.sort((a, b) => {
      const aOnline = a.status !== 'offline';
      const bOnline = b.status !== 'offline';
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;

      // In voice
      if (a.channel_id && !b.channel_id) return -1;
      if (!a.channel_id && b.channel_id) return 1;

      // In game
      if (a.game && !b.game) return -1;
      if (!a.game && b.game) return 1;

      // Role order: CHEF > SIRKEL > MALAZZ
      const roleWeight = (r?: string) => (r === 'CHEF' ? 3 : r === 'SIRKEL' ? 2 : 1);
      const weightDiff = roleWeight(b.role) - roleWeight(a.role);
      if (weightDiff !== 0) return weightDiff;

      return a.username.localeCompare(b.username);
    });

    const onlineCount = sortedMembers.filter((m) => m.status !== 'offline').length;
    const voiceCount = sortedMembers.filter((m) => m.channel_id).length;

    return {
      members: sortedMembers,
      totalCount: sortedMembers.length,
      onlineCount: onlineCount > 0 ? onlineCount : presenceCount,
      voiceCount,
      channels,
      instant_invite,
    };
  } catch (error) {
    console.error('Error fetching guild members via bot:', error);
    return {
      members: widgetMembers,
      totalCount: presenceCount,
      onlineCount: presenceCount,
      voiceCount: widgetMembers.filter((m) => m.channel_id).length,
      channels,
      instant_invite,
    };
  }
}
