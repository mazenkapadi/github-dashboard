// lib/cache/cacheManager.ts
import {supabase} from './supabaseClient';
import {githubMetrics} from '@/lib/github/metrics';
import type {GithubStatsResponse} from "@/types/github";

export async function getOrFetch(username: string, ttlMs: number): Promise<GithubStatsResponse> {
    const now = new Date();
    const {data: existing, error} = await supabase
        .from('github_cache')
        .select('*')
        .eq('username', username)
        .gt('expires_at', now.toISOString())
        .maybeSingle();

    if (!error && existing?.data) {
        return existing.data as GithubStatsResponse;
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

    return fresh;
}
