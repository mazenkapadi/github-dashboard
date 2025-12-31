// app/api/github/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrFetch } from '@/lib/cache/cacheManager';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json(
            { error: 'username is required' },
            { status: 400 },
        );
    }

    try {
        const stats = await getOrFetch(username, ONE_DAY_MS);

        return NextResponse.json(stats, {
            status: 200,
        });
    } catch (error) {
        console.error('Failed to fetch GitHub metrics', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub metrics' },
            { status: 500 },
        );
    }
}
