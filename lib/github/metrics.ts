// lib/github/metrics.ts

import { octokit } from './client';
import type {
    UserStats,
    Repo,
    LanguageStat,
    ContributionData,
    GithubStatsResponse,
} from '@/types/github';
import { getContributionData } from './contributions';

const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    // fallback later
};

export class GitHubMetrics {
    async getUserData(username: string): Promise<UserStats> {
        const { data: user } = await octokit.rest.users.getByUsername({ username });

        return {
            name: user.name ?? username,
            avatar: user.avatar_url,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            publicRepos: user.public_repos,
            totalStars: 0,  // filled in getAggregatedStats
            totalForks: 0,
            location: user.location,
        };
    }

    async getRepositories(username: string): Promise<Repo[]> {
        const { data: repos } = await octokit.rest.repos.listForUser({
            username,
            sort: 'updated',
            per_page: 100,
        });

        return repos.map((repo) => ({
            name: repo.name,
            url: repo.html_url,
            description: repo.description,
            stars: repo.stargazers_count ?? 0,
            forks: repo.forks_count ?? 0,
            language: repo.language ?? null,
            updatedAt: repo.updated_at!,
        }));
    }

    async getLanguages(username: string): Promise<LanguageStat[]> {
        const { data: repos } = await octokit.rest.repos.listForUser({
            username,
            per_page: 100,
        });

        const languageBytes: Record<string, number> = {};

        // Batch process repos in chunks of 10 to avoid overwhelming the API
        const CHUNK_SIZE = 10;
        const validRepos = repos.filter(repo => repo.name);
        
        for (let i = 0; i < validRepos.length; i += CHUNK_SIZE) {
            const chunk = validRepos.slice(i, i + CHUNK_SIZE);
            
            const languagePromises = chunk.map(repo =>
                octokit.rest.repos.listLanguages({
                    owner: username,
                    repo: repo.name,
                }).catch(error => {
                    console.warn(`Failed to fetch languages for ${repo.name}:`, error);
                    return { data: {} };
                })
            );

            const results = await Promise.all(languagePromises);
            
            results.forEach(({ data: langs }) => {
                Object.entries(langs).forEach(([lang, bytes]) => {
                    languageBytes[lang] = (languageBytes[lang] || 0) + (bytes as number);
                });
            });
        }

        const total = Object.values(languageBytes).reduce((sum, n) => sum + n, 0) || 1;

        return Object.entries(languageBytes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([language, bytes]) => ({
                language,
                bytes,
                percentage: (bytes / total) * 100,
                color: LANGUAGE_COLORS[language] ?? '#6b7280', // gray fallback
            }));
    }

    async getContributions(username: string): Promise<ContributionData> {
        return getContributionData(username);
    }

    async getAggregatedStats(username: string): Promise<GithubStatsResponse> {
        const [user, repos, languages, contributions] = await Promise.all([
            this.getUserData(username),
            this.getRepositories(username),
            this.getLanguages(username),
            this.getContributions(username),
        ]);

        const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
        const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);

        const enrichedUser: UserStats = {
            ...user,
            totalStars,
            totalForks,
        };

        const sortedRepos = [...repos].sort((a, b) => b.stars - a.stars).slice(0, 10);

        return {
            user: enrichedUser,
            repositories: sortedRepos,
            topLanguages: languages,
            contributions,
            timestamp: new Date().toISOString(),
        };
    }
}

export const githubMetrics = new GitHubMetrics();
