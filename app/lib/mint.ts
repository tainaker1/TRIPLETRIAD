import { createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToInstruction, getAssociatedTokenAddress, MINT_SIZE, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import type { Card } from '@mvp/game-engine';

export async function mintCardNft(connection: Connection, walletPubkey: PublicKey, signTransaction: any, _card: Card) {
  const mint = Keypair.generate();
  const ata = await getAssociatedTokenAddress(mint.publicKey, walletPubkey);
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const tx = new Transaction().add(
    SystemProgram.createAccount({ fromPubkey: walletPubkey, newAccountPubkey: mint.publicKey, lamports, space: MINT_SIZE, programId: TOKEN_PROGRAM_ID }),
    createInitializeMintInstruction(mint.publicKey, 0, walletPubkey, walletPubkey),
    createAssociatedTokenAccountInstruction(walletPubkey, ata, walletPubkey, mint.publicKey),
    createMintToInstruction(mint.publicKey, ata, walletPubkey, 1)
  );

  tx.feePayer = walletPubkey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.partialSign(mint);
  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(sig, 'confirmed');
  return { sig, mint: mint.publicKey.toBase58() };
}
