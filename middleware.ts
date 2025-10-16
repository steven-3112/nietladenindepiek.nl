import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection with role checks
    if (path.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      const roles = token.roles as string[] || [];

      // Check specific admin pages
      if (path.startsWith('/admin/handleidingen') && !roles.includes('MODERATOR')) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      if (path.startsWith('/admin/autos') && !roles.includes('CATALOG_MANAGER')) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      if (path.startsWith('/admin/gebruikers') && !roles.includes('USER_ADMIN')) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page even when not authenticated
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        // Require authentication for admin pages
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/login'],
};

