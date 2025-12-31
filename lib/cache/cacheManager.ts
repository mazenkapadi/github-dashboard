// lib/cache/cacheManager.ts
import {supabase} from './supabaseClient';
import {githubMetrics} from '@/lib/github/metrics';
import type {GithubStatsResponse} from "@/types/github";

// Granular TTLs for different data types
const TTL_CONFIG = {
    user: 7 * 24 * 60 * 60 * 1000,        // 7 days - profile changes rarely
    repos: 6 * 60 * 60 * 1000,            // 6 hours - repos update moderately
    contributions: 60 * 60 * 1000,        // 1 hour - contributions change frequently
    languages: 12 * 60 * 60 * 1000,       // 12 hours - language stats change slowly
};

export type CacheMetadata = {
    fetchedAt: string;
    servedFromCache: boolean;
    ttl: number;
};

export type CachedResponse = GithubStatsResponse & {
    cacheMetadata: CacheMetadata;
};

export async function getOrFetch(username: string, ttlMs: number): Promise<CachedResponse> {
    const now = new Date();
    const {data: existing, error} = await supabase
        .from('github_cache')
        .select('*')
        .eq('username', username)
        .gt('expires_at', now.toISOString())
        .maybeSingle();

    if (!error && existing?.data) {
        const cachedData = existing.data as GithubStatsResponse;
        return {
            ...cachedData,
            cacheMetadata: {
                fetchedAt: existing.created_at || cachedData.timestamp,
                servedFromCache: true,
                ttl: ttlMs,
            },
        };
    }

    const fresh = await githubMetrics.getAggregatedStats(username);
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();

    const upsertRes = await supabase
        .from('github_cache')
        .upsert(
            {
                username,
                data: fresh,
                expires_at: expiresAt,
            },
            {onConflict: 'username'},
        );

    if (upsertRes.error) {
        // Log but don't block the response
        console.error('Cache upsert error', upsertRes.error);
    }

    return {
        ...fresh,
        cacheMetadata: {
            fetchedAt: fresh.timestamp,
            servedFromCache: false,
            ttl: ttlMs,
        },
    };
}

/**
 * Get TTL configuration for fine-grained caching
 * Use the shortest TTL to ensure all data is reasonably fresh
 */
export function getRecommendedTTL(): number {
    return Math.min(...Object.values(TTL_CONFIG));
}

/**
 * Force fetch fresh data, bypassing cache
 */
export async function forceFetch(username: string, ttlMs: number): Promise<CachedResponse> {
    const fresh = await githubMetrics.getAggregatedStats(username);
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();

    const upsertRes = await supabase
        .from('github_cache')
        .upsert(
            {
                username,
                data: fresh,
                expires_at: expiresAt,
            },
            {onConflict: 'username'},
        );

    if (upsertRes.error) {
        console.error('Cache upsert error', upsertRes.error);
    }

    return {
        ...fresh,
        cacheMetadata: {
            fetchedAt: fresh.timestamp,
            servedFromCache: false,
            ttl: ttlMs,
        },
    };
}
