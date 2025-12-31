// types/github.ts
export interface UserStats {
    name: string;
    avatar: string;
    bio: string | null;
    followers: number;
    following: number;
    publicRepos: number;
    totalStars: number;
    totalForks: number;
    location?: string | null;
}

export interface Repo {
    name: string;
    url: string;
    description: string | null;
    stars: number;
    forks: number;
    language: string | null;
    updatedAt: string;
}

export interface LanguageStat {
    // Index signature to satisfy Recharts' ChartDataInput requirement
    [key: string]: string | number;
    language: string;
    bytes: number;
    percentage: number;
    color: string;
}

export interface ContributionDay {
    date: string;            // ISO date
    count: number;
    weekday: number;         // 0-6
}

export interface ContributionData {
    totalContributions: number;
    streak: number;
    lastYear: ContributionDay[];
}

export interface GithubStatsResponse {
    user: UserStats;
    repositories: Repo[];
    topLanguages: LanguageStat[];
    contributions: ContributionData;
    timestamp: string;
}
