// app/api/github/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrFetch, getRecommendedTTL, forceFetch } from '@/lib/cache/cacheManager';
import { GitHubAPIError } from '@/lib/github/client';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!username) {
        return NextResponse.json(
            { error: 'username is required' },
            { status: 400 },
        );
    }

    try {
        const stats = forceRefresh 
            ? await forceFetch(username, getRecommendedTTL())
            : await getOrFetch(username, getRecommendedTTL());

        return NextResponse.json(stats, {
            status: 200,
        });
    } catch (error) {
        console.error('Failed to fetch GitHub metrics', error);
        
        // Handle specific GitHub API errors
        if (error instanceof GitHubAPIError) {
            if (error.isRateLimit) {
                const resetTime = error.resetAt 
                    ? ` Try again after ${error.resetAt.toLocaleTimeString()}.`
                    : '';
                return NextResponse.json(
                    { 
                        error: `GitHub API rate limit exceeded.${resetTime}`,
                        code: 'RATE_LIMIT',
                        resetAt: error.resetAt?.toISOString(),
                    },
                    { status: 429 },
                );
            }
            
            if (error.statusCode === 404) {
                return NextResponse.json(
                    { 
                        error: `GitHub user "${username}" not found. Please check the username and try again.`,
                        code: 'USER_NOT_FOUND',
                    },
                    { status: 404 },
                );
            }
            
            return NextResponse.json(
                { 
                    error: error.message,
                    code: 'GITHUB_API_ERROR',
                },
                { status: error.statusCode },
            );
        }
        
        // Generic error
        return NextResponse.json(
            { 
                error: 'Failed to fetch GitHub metrics. Please try again later.',
                code: 'UNKNOWN_ERROR',
            },
            { status: 500 },
        );
    }
}
