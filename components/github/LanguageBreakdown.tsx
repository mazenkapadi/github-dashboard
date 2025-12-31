// components/github/LanguageBreakdown.tsx
'use client';

import {ResponsiveContainer, PieChart, Pie, Cell, Tooltip} from 'recharts';
import type {LanguageStat} from '@/types/github';

type Props = {
    languages: LanguageStat[];
};

export default function LanguageBreakdown({languages}: Props) {
    return (
        <div className="bg-[#08080b] border border-zinc-900 rounded-2xl px-6 py-5">
            <div className="mb-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-600">
                    Languages
                </p>
                <h3 className="text-lg font-medium text-zinc-50">Language breakdown</h3>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={languages}
                            dataKey="bytes"
                            nameKey="language"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={1}
                        >
                            {languages.map((lang) => (
                                <Cell key={lang.language} fill={lang.color}/>
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid #27272a',
                                borderRadius: '0.5rem',
                                fontSize: '11px',
                            }}
                            formatter={(value: number, _name, entry) => {
                                const l = entry.payload as LanguageStat;
                                return [
                                    `${l.percentage.toFixed(1)}%`,
                                    l.language,
                                ];
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
