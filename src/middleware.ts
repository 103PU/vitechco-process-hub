import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role, checkRouteAccess } from '@/lib/auth/rbac';

/**
 * Middleware for route protection and RBAC
 * 
 * TEMPORARY: Disabled auth checks until NextAuth is fully configured
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files, API routes, and auth pages
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') || // Files with extensions
        pathname === '/login' ||
        pathname === '/register'
    ) {
        return NextResponse.next();
    }

    // TEMPORARY: Skip auth checks for now
    // TODO: Enable after NextAuth is configured
    return NextResponse.next();

    /* COMMENTED OUT UNTIL NEXTAUTH IS CONFIGURED
    try {
      // Get user session
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      // Public routes - allow without auth
      const publicRoutes = ['/', '/search', '/docs'];
      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );
      
      if (isPublicRoute) {
        return NextResponse.next();
      }
      
      // Redirect to login if not authenticated
      if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      const userRole = token.role as Role | null;
      
      // Check route access based on role
      const hasAccess = checkRouteAccess(pathname, userRole);
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // Add user info to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', token.sub || '');
      requestHeaders.set('x-user-role', userRole || '');
      
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    } catch (error) {
      console.error('Middleware error:', error);
      // On error, allow request to proceed (fail open for development)
      return NextResponse.next();
    }
    */
}

/**
 * Configure which routes to run middleware on
 * DISABLED: Matcher causes Next.js error, will re-enable after NextAuth setup
 */
export const config = {
    matcher: [],  // Disabled until needed
};
