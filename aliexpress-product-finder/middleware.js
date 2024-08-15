import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./lib/rateLimiter";

export async function middleware(request)
{
    const rateLimitResult = await rateLimiter(request);
    if (!rateLimitResult.success) {
        return NextResponse.json({ error: 'Too many requests, please subscribe to remove rate limiting.' }, { status: 429 });
    }
    return request;
} 