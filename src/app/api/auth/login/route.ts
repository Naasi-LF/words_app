import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { pattern } = await request.json();
        const correctPattern = process.env.GESTURE_LOCK_PATTERN;

        if (!correctPattern) {
            console.error("GESTURE_LOCK_PATTERN not set in environment variables");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        if (pattern === correctPattern) {
            // Create a secure HttpOnly cookie
            const cookieStore = await cookies();
            cookieStore.set("auth_token", "authenticated", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: "/",
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "Invalid pattern" },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
