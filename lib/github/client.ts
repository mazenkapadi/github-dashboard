// lib/github/client.ts
import { Octokit } from '@octokit/rest';

/**
 * SECURITY: This token is ONLY used server-side in API routes and server components.
 * It must NEVER be exposed to the client. The token is accessed via process.env,
 * which Next.js does not bundle into client-side code unless prefixed with NEXT_PUBLIC_.
 */
const token = process.env.GITHUB_TOKEN || '';

if (!token) {
    console.warn('WARNING: GITHUB_TOKEN is not set. API requests may be rate limited.');
}

export const octokit = new Octokit({ auth: token });

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

export class GitHubAPIError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public isRateLimit: boolean = false,
        public resetAt?: Date,
    ) {
        super(message);
        this.name = 'GitHubAPIError';
    }
}

export async function githubGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    // Check for rate limiting
    if (res.status === 403) {
        const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
        const rateLimitReset = res.headers.get('x-ratelimit-reset');
        
        if (rateLimitRemaining === '0') {
            const resetAt = rateLimitReset 
                ? new Date(parseInt(rateLimitReset) * 1000) 
                : undefined;
            throw new GitHubAPIError(
                'GitHub API rate limit exceeded',
                403,
                true,
                resetAt,
            );
        }
    }

    if (!res.ok) {
        const errorMessage = res.status === 404 
            ? 'User not found'
            : `GitHub API error: ${res.status}`;
        throw new GitHubAPIError(errorMessage, res.status);
    }

    const json = await res.json();
    if (json.errors) {
        throw new GitHubAPIError(
            json.errors[0]?.message || 'GraphQL query failed',
            400,
        );
    }
    return json.data as T;
}

/**
 * Check rate limit status without making a data request
 */
export async function checkRateLimit(): Promise<{
    remaining: number;
    limit: number;
    resetAt: Date;
}> {
    try {
        const { data } = await octokit.rest.rateLimit.get();
        return {
            remaining: data.rate.remaining,
            limit: data.rate.limit,
            resetAt: new Date(data.rate.reset * 1000),
        };
    } catch {
        throw new GitHubAPIError('Failed to check rate limit', 500);
    }
}
