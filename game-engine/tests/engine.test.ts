import { describe, expect, it } from 'vitest';
import { applyMove, createInitialState, getWinner } from '../src/index';

const make = (id: string, top: number, right: number, bottom: number, left: number) => ({ id, name: id, top, right, bottom, left });

describe('capture rules', () => {
  it('captures one adjacent card', () => {
    const p1 = [make('a', 1, 8, 1, 1), make('f1',1,1,1,1), make('f2',1,1,1,1), make('f3',1,1,1,1), make('f4',1,1,1,1)];
    const p2 = [make('b', 1, 1, 1, 2), make('g1',1,1,1,1), make('g2',1,1,1,1), make('g3',1,1,1,1)];
    let state = createInitialState(p1, p2);
    state = applyMove(state, 'P1', 'a', 3);
    state = applyMove(state, 'P2', 'b', 4);
    expect(state.board[3]?.owner).toBe('P2');
  });

  it('captures multiple neighbors in one move', () => {
    const p1 = [make('fin', 9, 9, 9, 9), make('p1a',1,1,1,1), make('p1b',1,1,1,1), make('p1c',1,1,1,1), make('p1d',1,1,1,1)];
    const p2 = [make('up', 1, 1, 2, 1), make('left', 1, 2, 1, 1), make('right', 1, 1, 1, 2), make('bot', 2,1,1,1)];
    let state = createInitialState(p1, p2);
    state = applyMove(state, 'P1', 'p1a', 0);
    state = applyMove(state, 'P2', 'up', 1);
    state = applyMove(state, 'P1', 'p1b', 2);
    state = applyMove(state, 'P2', 'left', 3);
    state = applyMove(state, 'P1', 'p1c', 5);
    state = applyMove(state, 'P2', 'right', 7);
    state = applyMove(state, 'P1', 'p1d', 8);
    state = applyMove(state, 'P2', 'bot', 6);
    state = applyMove(state, 'P1', 'fin', 4);

    expect(state.board[1]?.owner).toBe('P1');
    expect(state.board[3]?.owner).toBe('P1');
    expect(state.board[7]?.owner).toBe('P1');
    expect(state.board[6]?.owner).toBe('P1');
  });

  it('calculates winner from final board ownership', () => {
    const p1 = [make('a', 1, 1, 1, 1), make('b', 1, 1, 1, 1), make('c', 1, 1, 1, 1), make('d',1,1,1,1), make('e',1,1,1,1)];
    const p2 = [make('f', 1, 1, 1, 1), make('g', 1, 1, 1, 1), make('h', 1, 1, 1, 1), make('i',1,1,1,1)];
    let state = createInitialState(p1, p2);
    const seq: Array<['P1'|'P2', string, number]> = [
      ['P1','a',0],['P2','f',1],['P1','b',2],['P2','g',3],['P1','c',4],['P2','h',5],['P1','d',6],['P2','i',7],['P1','e',8]
    ];
    for (const [pl, id, pos] of seq) state = applyMove(state, pl, id, pos);
    expect(getWinner(state)).toBe('P1');
  });
});
