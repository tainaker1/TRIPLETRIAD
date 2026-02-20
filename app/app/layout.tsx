import './globals.css';
import { SolanaProvider } from '../components/WalletProvider';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es"><body><SolanaProvider>
      <h1>Rune Grid Duel (MVP)</h1>
      <nav style={{display:'flex',gap:12}}>
        <Link href="/">Colección</Link>
        <Link href="/match">Match</Link>
      </nav>
      {children}
    </SolanaProvider></body></html>
  );
}
