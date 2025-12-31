import { NextRequest, NextResponse } from 'next/server';
import { getContributionData } from '@/lib/github/contributions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 });
  }

  try {
    const contributions = await getContributionData(username);
    return NextResponse.json(contributions, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch GitHub contributions', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub contributions' },
      { status: 500 },
    );
  }
}
