// components/github/TopRepositories.tsx
import type {Repo} from '@/types/github';

type Props = {
    repos: Repo[];
};

export default function TopRepositories({repos}: Props) {
    return (
        <div className="bg-[#08080b] border border-zinc-900 rounded-2xl px-6 py-5 space-y-4">
            <div className="flex items-baseline justify-between">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-600">
                        Repositories
                    </p>
                    <h3 className="text-lg font-medium text-zinc-50">Top repositories</h3>
                </div>
                <p className="text-[11px] text-zinc-500">
                    Sorted by stars
                </p>
            </div>

            <div className="space-y-3">
                {repos.map((repo, index) => (
                    <a
                        key={repo.name}
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-start gap-3 rounded-xl border border-zinc-900 bg-[#050507] px-4 py-3 hover:border-zinc-700 hover:bg-[#07070a] transition-colors"
                    >
                        <div className="mt-0.5 h-6 w-6 flex items-center justify-center rounded-full bg-zinc-900 text-[11px] text-zinc-400 group-hover:bg-zinc-800">
                            {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-zinc-50 group-hover:text-blue-400">
                                    {repo.name}
                                </p>
                                {repo.language && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        {repo.language}
                                    </span>
                                )}
                            </div>
                            {repo.description && (
                                <p className="text-xs text-zinc-500 line-clamp-2">
                                    {repo.description}
                                </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                                <span className="inline-flex items-center gap-1">
                                    <span className="text-[12px]">⭐</span>
                                    {repo.stars.toLocaleString()}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <span className="text-[12px]">🍴</span>
                                    {repo.forks.toLocaleString()}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
                                    Updated {new Date(repo.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
