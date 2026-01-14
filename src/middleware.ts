import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get("auth_token");
    const { pathname } = request.nextUrl;

    // Paths that don't require authentication
    const publicPaths = ["/login", "/api/auth/login", "/manifest.json", "/icons"];

    // Check if the current path is public
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (!authToken && !isPublicPath) {
        // Redirect to login page if no token and accessing protected route
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (authToken && pathname === "/login") {
        // Redirect to home if already authenticated and accessing login page
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
