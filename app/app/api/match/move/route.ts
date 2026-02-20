import { makeMove } from '../../../../lib/matchStore';

export async function POST(req: Request) {
  const { code, playerId, cardId, position } = await req.json();
  const match = makeMove(code, playerId, cardId, position);
  return Response.json({ state: match.state });
}
