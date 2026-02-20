export type PlayerId = 'P1' | 'P2';

export type Card = {
  id: string;
  name: string;
  top: number;
  right: number;
  bottom: number;
  left: number;
  source?: 'OFFCHAIN' | 'NFT';
  mint?: string;
};

export type PlacedCard = {
  card: Card;
  owner: PlayerId;
};

export type Cell = PlacedCard | null;
export type Board = Cell[];

export type MatchState = {
  board: Board;
  turn: PlayerId;
  hands: Record<PlayerId, Card[]>;
  moveHistory: Array<{ player: PlayerId; cardId: string; position: number }>;
};

const OPPOSITE: Record<'top' | 'right' | 'bottom' | 'left', 'top' | 'right' | 'bottom' | 'left'> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right'
};

const ADJACENT: Array<{ offset: number; side: keyof Card & ('top'|'right'|'bottom'|'left') }> = [
  { offset: -3, side: 'top' },
  { offset: 1, side: 'right' },
  { offset: 3, side: 'bottom' },
  { offset: -1, side: 'left' }
];

export function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => null);
}

export function createInitialState(p1Deck: Card[], p2Deck: Card[]): MatchState {
  return {
    board: emptyBoard(),
    turn: 'P1',
    hands: { P1: [...p1Deck], P2: [...p2Deck] },
    moveHistory: []
  };
}

function sameRow(position: number, target: number) {
  return Math.floor(position / 3) === Math.floor(target / 3);
}

function getNeighborIndex(position: number, side: 'top'|'right'|'bottom'|'left'): number | null {
  const bySide = {
    top: position - 3,
    right: position + 1,
    bottom: position + 3,
    left: position - 1
  };
  const idx = bySide[side];
  if (idx < 0 || idx > 8) return null;
  if ((side === 'right' || side === 'left') && !sameRow(position, idx)) return null;
  return idx;
}

export function applyMove(state: MatchState, player: PlayerId, cardId: string, position: number): MatchState {
  if (player !== state.turn) throw new Error('Not your turn');
  if (position < 0 || position > 8) throw new Error('Invalid position');
  if (state.board[position]) throw new Error('Cell occupied');

  const cardIndex = state.hands[player].findIndex(c => c.id === cardId);
  if (cardIndex === -1) throw new Error('Card not in hand');
  const card = state.hands[player][cardIndex];

  const board = [...state.board];
  board[position] = { card, owner: player };

  for (const dir of ADJACENT) {
    const neighborIndex = getNeighborIndex(position, dir.side);
    if (neighborIndex === null) continue;
    const neighbor = board[neighborIndex];
    if (!neighbor || neighbor.owner === player) continue;

    const mine = card[dir.side] as number;
    const theirs = neighbor.card[OPPOSITE[dir.side]] as number;
    if (mine > theirs) {
      board[neighborIndex] = { ...neighbor, owner: player };
    }
  }

  const hands = {
    ...state.hands,
    [player]: state.hands[player].filter(c => c.id !== cardId)
  };

  return {
    board,
    turn: player === 'P1' ? 'P2' : 'P1',
    hands,
    moveHistory: [...state.moveHistory, { player, cardId, position }]
  };
}

export function isMatchOver(state: MatchState): boolean {
  return state.board.every(Boolean);
}

export function countOwners(board: Board): Record<PlayerId, number> {
  return board.reduce(
    (acc, cell) => {
      if (cell) acc[cell.owner] += 1;
      return acc;
    },
    { P1: 0, P2: 0 } as Record<PlayerId, number>
  );
}

export function getWinner(state: MatchState): PlayerId | 'DRAW' | null {
  if (!isMatchOver(state)) return null;
  const c = countOwners(state.board);
  if (c.P1 === c.P2) return 'DRAW';
  return c.P1 > c.P2 ? 'P1' : 'P2';
}
