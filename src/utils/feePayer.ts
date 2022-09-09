import {Connection, Keypair} from '@solana/web3.js';
import * as redis from 'redis';
import base58 from 'bs58';

export const SIGNATURES_PER_USER = 8; // each transaction requires at least two signatures. fee payer pays for each signature.

export const connection = new Connection('https://api.mainnet-beta.solana.com/', {commitment: 'confirmed'});
export const feePayer = Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY));
export const redisClient = redis.createClient({url: process.env.REDIS_URL});

export function getRedisKeyForSignaturesCount(sub: string): string {
  return `signatures_${sub}`;
}

export function getRedisKeyForSignatureRecord(signature: string): string {
  return `transaction_${signature}`;
}
