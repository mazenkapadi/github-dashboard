// components/github/GitHubDashboard.tsx
'use client';

import {useEffect, useState} from 'react';
import UserCard from './UserCard';
import TopRepositories from './TopRepositories';
import LanguageBreakdown from './LanguageBreakdown';
import ContributionHeatmap from './ContributionHeatmap';
import StatisticsPanel from './StatisticsPanel';
import type {GithubStatsResponse} from '@/types/github';
import type {CacheMetadata} from '@/lib/cache/cacheManager';

type Props = {
    username: string;
};

export default function GitHubDashboard({username}: Props) {
    const [stats, setStats] = useState<GithubStatsResponse | null>(null);
    const [cacheMetadata, setCacheMetadata] = useState<CacheMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errorCode, setErrorCode] = useState('');
    const [inputUsername, setInputUsername] = useState(username);
    const [activeUsername, setActiveUsername] = useState(username);

    useEffect(() => {
        setInputUsername(username);
        setActiveUsername(username);
        void fetchStats(username);
    }, [username]);

    async function fetchStats(user: string, forceRefresh = false) {
        setLoading(true);
        setError('');
        setErrorCode('');
        try {
            const url = `/api/github/stats?username=${encodeURIComponent(user)}${forceRefresh ? '&refresh=true' : ''}`;
            const res = await fetch(url);
            
            if (!res.ok) {
                const errorData = await res.json();
                
                // Set specific error messages based on error code
                if (errorData.code === 'USER_NOT_FOUND') {
                    setError(`User "${user}" not found on GitHub. Please check the username.`);
                } else if (errorData.code === 'RATE_LIMIT') {
                    setError(`GitHub API rate limit exceeded. ${errorData.resetAt ? `Try again after ${new Date(errorData.resetAt).toLocaleTimeString()}.` : 'Please try again later.'}`);
                } else {
                    setError(errorData.error || 'Failed to load GitHub stats.');
                }
                setErrorCode(errorData.code || 'UNKNOWN');
                return;
            }
            
            const data = await res.json();
            
            // Extract cache metadata if present
            if (data.cacheMetadata) {
                setCacheMetadata(data.cacheMetadata);
                // Remove metadata from stats object
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { cacheMetadata, ...statsData } = data;
                setStats(statsData);
            } else {
                setStats(data);
                setCacheMetadata(null);
            }
            
            setActiveUsername(user);
        } catch {
            setError('Network error. Please check your connection and try again.');
            setErrorCode('NETWORK_ERROR');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#050507] text-zinc-100">
            <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
                <header className="space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-2">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-600">
                                GitHub · Metrics
                            </p>
                            <h1 className="text-3xl font-medium text-zinc-50">
                                Personal GitHub Dashboard
                            </h1>
                            <p className="text-sm text-zinc-500 max-w-md">
                                Visualize your coding activity, language usage, and repository performance in one place.
                            </p>
                            <p className="text-xs text-zinc-600">
                                Viewing <span className="font-mono text-zinc-300">@{activeUsername}</span>
                            </p>
                        </div>

                        <form
                            className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-zinc-800 bg-[#050507] px-3 py-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const next = inputUsername.trim();
                                if (!next || next === activeUsername) return;
                                void fetchStats(next);
                            }}
                        >
                            <input
                                type="text"
                                value={inputUsername}
                                onChange={(e) => setInputUsername(e.target.value)}
                                placeholder="Enter GitHub username"
                                className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-black hover:bg-zinc-200 disabled:opacity-40"
                                disabled={!inputUsername.trim() || inputUsername.trim() === activeUsername}
                            >
                                View
                            </button>
                        </form>
                    </div>
                </header>

                {error && (
                    <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                        <p className="font-medium">{error}</p>
                        {errorCode && (
                            <p className="mt-1 text-[10px] text-red-400/70 font-mono">Error code: {errorCode}</p>
                        )}
                    </div>
                )}

                {cacheMetadata && stats && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs text-zinc-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${cacheMetadata.servedFromCache ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                            <span>
                                {cacheMetadata.servedFromCache ? 'Cached data' : 'Fresh data'} from{' '}
                                {new Date(cacheMetadata.fetchedAt).toLocaleString()}
                            </span>
                        </div>
                        <button
                            onClick={() => void fetchStats(activeUsername, true)}
                            disabled={loading}
                            className="rounded-md bg-zinc-800 px-3 py-1 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Force refresh data from GitHub"
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                )}

                {loading && (
                    <p className="text-[11px] text-zinc-500">Loading data…</p>
                )}

                {stats && (
                    <>
                        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                            <div className="space-y-6">
                                <UserCard user={stats.user}/>
                                <TopRepositories repos={stats.repositories}/>
                            </div>

                            <div className="space-y-6">
                                <StatisticsPanel stats={stats}/>
                                <LanguageBreakdown languages={stats.topLanguages}/>
                            </div>
                        </div>

                        <ContributionHeatmap contributions={stats.contributions}/>
                    </>
                )}

                {!stats && !loading && !error && (
                    <p className="text-sm text-zinc-500">
                        Enter a GitHub username above to load your dashboard.
                    </p>
                )}
            </div>
        </div>
    );
}
