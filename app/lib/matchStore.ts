import { Card, MatchState, applyMove, createInitialState } from '@mvp/game-engine';

type Match = { code: string; players: string[]; state: MatchState };
const store = new Map<string, Match>();

export function createMatch(playerId: string, deck: Card[]) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  store.set(code, { code, players: [playerId], state: createInitialState(deck, []) });
  return code;
}

export function joinMatch(code: string, playerId: string, deck: Card[]) {
  const match = store.get(code);
  if (!match) throw new Error('Match no encontrado');
  if (match.players.length >= 2 && !match.players.includes(playerId)) throw new Error('Match lleno');
  if (!match.players.includes(playerId)) match.players.push(playerId);
  if (match.state.hands.P2.length === 0) match.state.hands.P2 = deck;
  return match;
}

export function getMatch(code: string) {
  return store.get(code);
}

export function makeMove(code: string, playerId: string, cardId: string, position: number) {
  const match = store.get(code);
  if (!match) throw new Error('Match no encontrado');
  const player = match.players[0] === playerId ? 'P1' : match.players[1] === playerId ? 'P2' : null;
  if (!player) throw new Error('Jugador no pertenece a la partida');
  match.state = applyMove(match.state, player, cardId, position);
  return match;
}
