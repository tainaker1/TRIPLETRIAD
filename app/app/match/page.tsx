'use client';
import { Card, MatchState, countOwners, getWinner } from '@mvp/game-engine';
import { useEffect, useMemo, useState } from 'react';

function getPlayerId() {
  const k = 'player-id';
  const existing = localStorage.getItem(k);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(k, id);
  return id;
}

export default function MatchPage() {
  const [code, setCode] = useState('');
  const [joinedCode, setJoinedCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [state, setState] = useState<MatchState | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => setPlayerId(getPlayerId()), []);

  useEffect(() => {
    if (!joinedCode) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/match/state?code=${joinedCode}`);
      if (res.ok) {
        const json = await res.json();
        setState(json.state);
        setPlayers(json.players);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [joinedCode]);

  const mySide = useMemo(() => players[0] === playerId ? 'P1' : players[1] === playerId ? 'P2' : null, [players, playerId]);
  const myHand = mySide && state ? state.hands[mySide] : [];

  const create = async () => {
    const deck = JSON.parse(localStorage.getItem('deck') || '[]');
    const res = await fetch('/api/match/create', { method: 'POST', body: JSON.stringify({ playerId, deck }) });
    const json = await res.json();
    setJoinedCode(json.code);
  };

  const join = async () => {
    const deck = JSON.parse(localStorage.getItem('deck') || '[]');
    const res = await fetch('/api/match/join', { method: 'POST', body: JSON.stringify({ playerId, code, deck }) });
    if (res.ok) setJoinedCode(code.toUpperCase());
  };

  const move = async (position: number) => {
    if (!selectedCard || !joinedCode) return;
    await fetch('/api/match/move', { method: 'POST', body: JSON.stringify({ code: joinedCode, playerId, cardId: selectedCard.id, position }) });
    setSelectedCard(null);
  };

  const counts = state ? countOwners(state.board) : { P1: 0, P2: 0 };
  const winner = state ? getWinner(state) : null;

  return <main>
    <h2>Match</h2>
    <button onClick={create}>Crear partida</button>
    <input placeholder='Código' value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
    <button onClick={join}>Unirse</button>
    <p>Código activo: {joinedCode || '-'}</p>
    <p>Tu lado: {mySide || 'espectador'}</p>
    <p>Turno: {state?.turn || '-'}</p>
    <p>Conteo P1 {counts.P1} - P2 {counts.P2} {winner ? `| Ganador: ${winner}` : ''}</p>
    <div className='row'>
      <div>
        <h3>Tablero</h3>
        <div className='grid'>
          {Array.from({ length: 9 }).map((_, i) => {
            const c = state?.board[i];
            return <button className='cell' key={i} onClick={() => move(i)}>
              {c ? <div style={{fontSize:12}}>{c.card.name}<br />{c.owner}</div> : '+'}
            </button>;
          })}
        </div>
      </div>
      <div>
        <h3>Tu mano</h3>
        {myHand?.map((c) => <div key={c.id} className='card'>
          <strong>{c.name}</strong> T:{c.top} R:{c.right} B:{c.bottom} L:{c.left}
          <button onClick={() => setSelectedCard(c)}>{selectedCard?.id === c.id ? 'Seleccionada' : 'Seleccionar'}</button>
        </div>)}
      </div>
    </div>
  </main>;
}
