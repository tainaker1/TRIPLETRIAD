import { createMatch } from '../../../../lib/matchStore';

export async function POST(req: Request) {
  const { playerId, deck } = await req.json();
  const code = createMatch(playerId, deck);
  return Response.json({ code });
}
