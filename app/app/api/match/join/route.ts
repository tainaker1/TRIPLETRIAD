import { joinMatch } from '../../../../lib/matchStore';

export async function POST(req: Request) {
  const { playerId, code, deck } = await req.json();
  const match = joinMatch(code, playerId, deck);
  return Response.json({ players: match.players });
}
