import { getMatch } from '../../../../lib/matchStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') || '';
  const match = getMatch(code);
  if (!match) return new Response('Not found', { status: 404 });
  return Response.json({ players: match.players, state: match.state });
}
