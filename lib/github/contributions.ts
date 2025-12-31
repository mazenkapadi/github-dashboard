// lib/github/contributions.ts
import { githubGraphQL } from './client';
import type { ContributionData, ContributionDay } from '@/types/github';

const CONTRIBUTIONS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

type ContributionsResponse = {
    user: {
        contributionsCollection: {
            contributionCalendar: {
                totalContributions: number;
                weeks: {
                    contributionDays: {
                        date: string;
                        contributionCount: number;
                        weekday: number;
                    }[];
                }[];
            };
        };
    };
};

function computeCurrentStreak(days: ContributionDay[]): number {
    // Sort descending by date
    const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (!sorted.length) return 0;

    let streak = 0;
    const currentDate = new Date(sorted[0].date);

    for (const day of sorted) {
        const d = new Date(day.date);

        if (day.count === 0 && streak === 0 && d.toDateString() === currentDate.toDateString()) {
            // If today is zero contributions, streak is 0
            break;
        }

        if (day.count > 0 && d.toDateString() === currentDate.toDateString()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (d.toDateString() === currentDate.toDateString()) {
            break;
        } else {
            // If there's a gap, stop streak
            break;
        }
    }

    return streak;
}

export async function getContributionData(username: string): Promise<ContributionData> {
    const data = await githubGraphQL<ContributionsResponse>(CONTRIBUTIONS_QUERY, {
        username,
    });

    const weeks = data.user.contributionsCollection.contributionCalendar.weeks;

    const lastYear: ContributionDay[] = weeks.flatMap((week) =>
        week.contributionDays.map((day) => ({
            date: day.date,
            count: day.contributionCount,
            weekday: day.weekday,
        })),
    );

    const totalContributions =
        data.user.contributionsCollection.contributionCalendar.totalContributions;

    const streak = computeCurrentStreak(lastYear);

    return {
        totalContributions,
        streak,
        lastYear,
    };
}
