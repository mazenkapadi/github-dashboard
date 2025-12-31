// app/github/[username]/page.tsx
import GitHubDashboard from '@/components/github/GitHubDashboard';

type Props = {
    params: Promise<{ username: string }>;
};

export default async function UserDashboardPage({ params }: Props) {
    const { username } = await params;

    return <GitHubDashboard username={username} />;
}
