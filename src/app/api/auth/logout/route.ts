import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin || 'http://localhost:3000';
  const response = NextResponse.redirect(`${baseUrl}/?logout=success`);

  response.cookies.delete('supermalazz_session');
  response.cookies.delete('supermalazz_role');

  return response;
}
