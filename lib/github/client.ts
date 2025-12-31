// lib/github/client.ts
import { Octokit } from '@octokit/rest';

const token = process.env.GITHUB_TOKEN || '';
export const octokit = new Octokit({ auth: token });

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

export async function githubGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
        throw new Error(`GitHub GraphQL error: ${res.status}`);
    }

    const json = await res.json();
    if (json.errors) {
        throw new Error(JSON.stringify(json.errors));
    }
    return json.data as T;
}
