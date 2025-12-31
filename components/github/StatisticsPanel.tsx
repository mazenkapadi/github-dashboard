// components/github/StatisticsPanel.tsx
import type {GithubStatsResponse} from '@/types/github';

type Props = {
    stats: GithubStatsResponse;
};

export default function StatisticsPanel({stats}: Props) {
    const {user, contributions} = stats;

    const items = [
        {label: 'Total stars', value: user.totalStars},
        {label: 'Total forks', value: user.totalForks},
        {label: 'Total contributions (year)', value: contributions.totalContributions},
        {label: 'Current streak (days)', value: contributions.streak},
    ];

    return (
        <div className="bg-[#08080b] border border-zinc-900 rounded-2xl px-6 py-5">
            <div className="mb-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-600">
                    Metrics
                </p>
                <h3 className="text-lg font-medium text-zinc-50">Statistics</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-zinc-900 bg-[#050507] px-3 py-3"
                    >
                        <p className="text-[11px] text-zinc-500 mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-zinc-100">
                            {item.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
