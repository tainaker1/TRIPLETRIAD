# Rune Grid Duel MVP (inspirado en mecánica tipo Triple Triad, IP original)

## Stack
- `app/`: Next.js + TypeScript + Wallet Adapter (Devnet)
- `game-engine/`: motor determinista en TS (sin React)
- `program/`: placeholder para evolución on-chain (Anchor opcional)

## Funcionalidades MVP
- Tablero 3x3, turnos alternos, capturas por regla `mayor que`.
- Fin de partida al llenar tablero, ganador por conteo de owners.
- Colección con cartas demo + NFTs (tokens supply 1 / decimals 0 del wallet).
- Deck de 5 cartas en `localStorage`.
- Match por código (create/join) con sincronización por polling a API routes.
- Mint de carta (devnet) desde la app.

## Run local
```bash
npm install
npm run test -w game-engine
npm run dev -w app
```
Abrir http://localhost:3000

## Cómo jugar
1. Conecta wallet (Devnet) en pantalla **Colección**.
2. (Opcional) pulsa **Mint carta** para crear un token tipo NFT (1 unidad, 0 decimales).
3. Selecciona hasta 5 cartas para tu deck.
4. Ve a **Match**:
   - Jugador 1 crea partida (obtiene código).
   - Jugador 2 se une con código.
5. Selecciona carta de mano y luego casilla vacía para jugar turno.

## Seguridad / límites del MVP
- Validación de movimientos en servidor (turno, celda libre, carta en mano) usando mismo motor determinista.
- Estado de partida en memoria del servidor (se pierde al reiniciar).
- Anti-cheat básico; no hay firmas criptográficas por move.
- Gameplay no se ejecuta on-chain por coste/latencia.
- Evolución recomendada: receipt on-chain + persistencia DB + websocket + metadata NFT completa con Metaplex.
