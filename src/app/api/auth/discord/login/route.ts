import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/discord/callback';

  if (!clientId) {
    return NextResponse.json({ error: 'DISCORD_CLIENT_ID belum diatur di .env' }, { status: 500 });
  }

  // Discord OAuth2 authorize URL with required scopes
  const scopes = ['identify', 'guilds', 'guilds.members.read'].join(' ');
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes)}`;

  return NextResponse.redirect(authUrl);
}
