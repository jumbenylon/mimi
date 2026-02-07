import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Check for the "auth_token" cookie
  const token = request.cookies.get('mimi_auth');
  const { pathname } = request.nextUrl;

  // 2. If user is already on /login, let them stay there
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // 3. If no token, kick them to /login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 4. If token exists, let them pass
  return NextResponse.next();
}

// Protect these paths (Everything except images and static files)
export const config = {
  matcher: ['/', '/dashboard', '/loans', '/budget', '/invest', '/goals', '/analytics'],
};
