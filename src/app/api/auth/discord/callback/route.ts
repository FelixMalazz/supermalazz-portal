import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = request.nextUrl.origin || 'http://localhost:3000';

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=${error || 'no_code'}`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${baseUrl}/api/auth/discord/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=missing_credentials`);
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Discord token exchange failed:', errorText);
      return NextResponse.redirect(`${baseUrl}/?auth_error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch User identity
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=fetch_user_failed`);
    }

    const discordUser = await userResponse.json();
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(discordUser.id.slice(-1)) % 5}.png`;

    // 3. Fetch Guild member to map roles (CHEF, SIRKEL, MALAZZ)
    const guildId = process.env.DISCORD_GUILD_ID || '976042783443943464';
    const chefRoleId = process.env.DISCORD_ROLE_CHEF_ID || '1146093007729348629';
    const sirkelRoleId = process.env.DISCORD_ROLE_SIRKEL_ID || '1030705472120041473';

    let assignedRole: UserRole = 'MALAZZ';
    let joinedGuildAt: Date | null = null;

    try {
      const memberResponse = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (memberResponse.ok) {
        const memberData = await memberResponse.json();
        const roles: string[] = memberData.roles || [];

        if (roles.includes(chefRoleId)) {
          assignedRole = 'CHEF';
        } else if (roles.includes(sirkelRoleId)) {
          assignedRole = 'SIRKEL';
        } else {
          assignedRole = 'MALAZZ';
        }

        if (memberData.joined_at) {
          joinedGuildAt = new Date(memberData.joined_at);
        }
      } else {
        // User not in guild, defaults to MALAZZ as per policy
        assignedRole = 'MALAZZ';
      }
    } catch (err) {
      console.warn('Could not fetch guild member, defaulting to MALAZZ:', err);
      assignedRole = 'MALAZZ';
    }

    // 4. Upsert user into PostgreSQL database
    try {
      await prisma.user.upsert({
        where: { id: discordUser.id },
        update: {
          username: discordUser.username,
          displayName: discordUser.global_name || discordUser.username,
          avatar: avatarUrl,
          role: assignedRole,
          joinedGuildAt,
        },
        create: {
          id: discordUser.id,
          username: discordUser.username,
          displayName: discordUser.global_name || discordUser.username,
          avatar: avatarUrl,
          role: assignedRole,
          joinedGuildAt,
        },
      });
    } catch (dbErr) {
      console.error('Failed to upsert user in DB:', dbErr);
    }

    // 5. Create session object
    const sessionData = {
      id: discordUser.id,
      username: discordUser.username,
      displayName: discordUser.global_name || discordUser.username,
      avatar: avatarUrl,
      role: assignedRole,
      isDiscordAuth: true,
    };

    // 6. Set session cookies and redirect
    const response = NextResponse.redirect(`${baseUrl}/?login=success`);
    
    response.cookies.set('supermalazz_session', JSON.stringify(sessionData), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set('supermalazz_role', assignedRole, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Discord callback exception:', error);
    return NextResponse.redirect(`${baseUrl}/?auth_error=internal_error`);
  }
}
