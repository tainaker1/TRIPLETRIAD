'use client';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card } from '@mvp/game-engine';
import { useEffect, useMemo, useState } from 'react';
import { demoCards } from '../lib/cards';
import { mintCardNft } from '../lib/mint';

type WalletNftCard = Card & { mint: string };

function randomCardFromDemo() {
  const base = demoCards[Math.floor(Math.random() * demoCards.length)];
  return { ...base, id: `mint-${crypto.randomUUID()}`, source: 'NFT' as const };
}

export default function CollectionPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [nfts, setNfts] = useState<WalletNftCard[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('deck');
    if (raw) setDeck(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem('deck', JSON.stringify(deck.slice(0, 5)));
  }, [deck]);

  async function loadWalletNfts() {
    if (!wallet.publicKey) return;
    const tokens = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: new (await import('@solana/web3.js')).PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') });
    const onlyNfts: WalletNftCard[] = tokens.value
      .filter((a) => a.account.data.parsed.info.tokenAmount.amount === '1' && a.account.data.parsed.info.tokenAmount.decimals === 0)
      .map((a, idx) => ({ id: `wallet-${idx}-${a.account.data.parsed.info.mint}`, name: `NFT ${a.account.data.parsed.info.mint.slice(0,6)}`, top: 5, right: 5, bottom: 5, left: 5, source: 'NFT', mint: a.account.data.parsed.info.mint }));
    setNfts(onlyNfts);
  }

  useEffect(() => { loadWalletNfts(); }, [wallet.publicKey]);

  const allCards = useMemo(() => [...demoCards, ...nfts], [nfts]);

  const toggleDeck = (card: Card) => {
    setDeck((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      if (exists) return prev.filter((c) => c.id !== card.id);
      if (prev.length >= 5) return prev;
      return [...prev, card];
    });
  };

  const onMint = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return setStatus('Conecta wallet primero');
    const card = randomCardFromDemo();
    setStatus('Minteando...');
    try {
      const res = await mintCardNft(connection, wallet.publicKey, wallet.signTransaction, card);
      setStatus(`Mint OK: ${res.mint}`);
      await loadWalletNfts();
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return <main>
    <WalletMultiButton />
    <p>{status}</p>
    <button onClick={onMint}>Mint carta</button>
    <h2>Colección</h2>
    {allCards.map((c) => <div key={c.id} className="card">
      <strong>{c.name}</strong> {c.source === 'NFT' ? '(NFT)' : '(Demo)'} {c.mint ? `- ${c.mint}` : ''}
      <div>T:{c.top} R:{c.right} B:{c.bottom} L:{c.left}</div>
      <button onClick={() => toggleDeck(c)}>{deck.some((d) => d.id === c.id) ? 'Quitar del deck' : 'Agregar al deck'}</button>
    </div>)}
    <h3>Deck seleccionado ({deck.length}/5)</h3>
    {deck.map((d) => <div key={d.id}>{d.name}</div>)}
  </main>;
}
