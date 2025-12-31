// components/github/UserCard.tsx
import type { UserStats } from '@/types/github';

type Props = {
    user: UserStats;
};

export default function UserCard({ user }: Props) {
    return (
        <div className="flex items-center gap-6 bg-[#08080b] border border-zinc-900 rounded-2xl px-6 py-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full border border-zinc-800"
            />
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                {user.bio && <p className="text-sm text-zinc-500">{user.bio}</p>}
                {user.location && (
                    <p className="text-xs text-zinc-600">{user.location}</p>
                )}
                <div className="flex gap-4 text-xs text-zinc-400 mt-2">
                    <span>{user.followers} followers</span>
                    <span>{user.following} following</span>
                    <span>{user.publicRepos} public repos</span>
                </div>
            </div>
        </div>
    );
}
