import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil token dari cookies
  const token = request.cookies.get('token')?.value;

  // 2. Daftar halaman yang butuh login
  const protectedPaths = ['/bookmarks', '/profile']; 
  
  // 3. Cek apakah user sedang mengakses halaman protected
  if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      // Kalau ga ada token, tendang ke login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 4. Kalau user sudah login, jangan kasih masuk ke halaman login/register lagi
  if (token && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
     return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Tentukan route mana saja yang mau dipantau middleware
export const config = {
  matcher: ['/bookmarks/:path*', '/profile/:path*', '/login', '/register'],
};