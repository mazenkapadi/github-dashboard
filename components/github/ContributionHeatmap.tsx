// components/github/ContributionHeatmap.tsx
'use client';

import {useMemo, useState} from 'react';
import type {ContributionData} from '@/types/github';
type Props = {
    contributions: ContributionData;
};

export default function ContributionHeatmap({contributions}: Props) {
    const days = contributions.lastYear;

    const [range, setRange] = useState<7 | 30 | 365>(30);

    const windowedDays = useMemo(() => {
        if (range === 365) return days;
        return days.slice(-range);
    }, [days, range]);

    const max = windowedDays.reduce((m, d) => Math.max(m, d.count), 0) || 1;

    function getColor(count: number) {
        if (count === 0) return 'bg-zinc-900';
        const intensity = count / max;
        if (intensity < 0.25) return 'bg-emerald-900/60';
        if (intensity < 0.5) return 'bg-emerald-700/70';
        if (intensity < 0.75) return 'bg-emerald-500/80';
        return 'bg-emerald-400/90';
    }

    return (
        <div className="bg-[#08080b] border border-zinc-900 rounded-2xl px-6 py-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-600">
                        Activity
                    </p>
                    <h3 className="text-lg font-medium text-zinc-50">
                        {range === 365 ? 'Last 365 days' : `Last ${range} days`}
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                        {contributions.totalContributions.toLocaleString()} contributions this year
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-[10px]">
                    <div className="inline-flex rounded-full bg-zinc-900/80 ring-1 ring-zinc-800 p-0.5 shadow-sm">
                        {[7, 30, 365].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRange(value as 7 | 30 | 365)}
                                className={`px-3 py-0.5 rounded-full transition-colors ${
                                    range === value
                                        ? 'bg-zinc-100 text-black'
                                        : 'text-zinc-400 hover:text-zinc-100'
                                }`}
                            >
                                {value === 365 ? '1 year' : `${value} days`}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                        <span className="inline-block h-2 w-2 rounded-sm bg-zinc-900" />
                        <span className="inline-block h-2 w-2 rounded-sm bg-emerald-900/60" />
                        <span className="inline-block h-2 w-2 rounded-sm bg-emerald-700/70" />
                        <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/80" />
                        <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400/90" />
                        <span className="ml-1">low → high activity</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-30 gap-1 overflow-x-auto">
                {windowedDays.map((day) => (
                    <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                        title={`${day.date}: ${day.count} contributions`}
                    />
                ))}
            </div>

            <p className="text-[11px] text-zinc-500">
                Inspired by GitHub’s contribution calendar.
            </p>
        </div>
    );
}
