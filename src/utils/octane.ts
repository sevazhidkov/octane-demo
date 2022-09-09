import axios from "axios";
import base58 from "bs58";
import {Connection, PublicKey, Transaction} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress
} from "@solana/spl-token";

export type TokenFee = {
  mint: string;
  account: string;
  decimals: number;
  fee: number;
};

export type OctaneConfig = {
  feePayer: string;
  rpcUrl: string;
  maxSignatures: number;
  lamportsPerSignature: number;
  corsOrigin: boolean;
  endpoints: {
    transfer: { tokens: TokenFee[] },
    createAssociatedTokenAccount: { tokens: TokenFee[] },
    whirlpoolsSwap: { tokens: TokenFee[] },
  };
};

type WhirlpoolsQuote = {
  estimatedAmountIn: string;
  estimatedAmountOut: string;
  estimatedEndTickIndex: number;
  estimatedEndSqrtPrice: string;
  estimatedFeeAmount: string;
  amount: string;
  amountSpecifiedIsInput: boolean;
  aToB: boolean;
  otherAmountThreshold: string;
  sqrtPriceLimit: string;
  tickArray0: string;
  tickArray1: string;
  tickArray2: string;
}

export interface BuildWhirlpoolsSwapResponse {
  status: 'ok';
  transaction: string;
  quote: WhirlpoolsQuote;
  messageToken: string;
}

const OCTANE_ENDPOINT = 'https://octane-mainnet-beta.breakroom.show/api';
// const OCTANE_ENDPOINT = 'http://localhost:3001/api';

export async function loadOctaneConfig(): Promise<OctaneConfig> {
  return (await axios.get(OCTANE_ENDPOINT)).data as OctaneConfig;
}

export async function createAssociatedTokenAccount(transaction: Transaction): Promise<string> {
  const response = (await axios.post(OCTANE_ENDPOINT + '/createAssociatedTokenAccount', {
    transaction: base58.encode(transaction.serialize({requireAllSignatures: false})),
  })).data;
  return response.signature as string;
}

export async function sendTransactionWithTokenFee(transaction: Transaction): Promise<string> {
  const response = (await axios.post(OCTANE_ENDPOINT + '/transfer', {
    transaction: base58.encode(transaction.serialize({requireAllSignatures: false})),
  })).data;
  return response.signature as string;
}

export async function buildWhirlpoolsSwapTransaction(
  user: PublicKey, sourceMint: PublicKey, amount: number, slippingTolerance: number = 0.5
): Promise<{transaction: Transaction, quote: WhirlpoolsQuote, messageToken: string}> {
  const response = (await axios.post(OCTANE_ENDPOINT + '/buildWhirlpoolsSwap', {
    user: user.toBase58(),
    sourceMint: sourceMint.toBase58(),
    amount: amount,
    slippingTolerance: slippingTolerance,
  })).data as BuildWhirlpoolsSwapResponse;
  return {
    transaction: Transaction.from(base58.decode(response.transaction)),
    quote: response.quote,
    messageToken: response.messageToken
  };
}

export async function sendWhirlpoolsSwapTransaction(
  transaction: Transaction, messageToken: string,
): Promise<string> {
  const response = (await axios.post(OCTANE_ENDPOINT + '/sendWhirlpoolsSwap', {
    transaction: base58.encode(transaction.serialize({requireAllSignatures: false})),
    messageToken
  })).data;
  return response.signature as string;
}

export async function buildTransactionToTransfer(
  connection: Connection,
  feePayer: PublicKey,
  fee: TokenFee,
  mint: PublicKey,
  sender: PublicKey,
  recipient: PublicKey,
  transferAmountInDecimals: number,
): Promise<Transaction> {
  const feeInstruction = createTransferInstruction(
    await getAssociatedTokenAddress(mint, sender),
    new PublicKey(fee.account),
    sender,
    fee.fee
  );
  const transferInstruction = createTransferInstruction(
    await getAssociatedTokenAddress(mint, sender),
    await getAssociatedTokenAddress(mint, recipient),
    sender,
    transferAmountInDecimals
  );
  return (new Transaction({
    recentBlockhash: (await connection.getRecentBlockhashAndContext()).value.blockhash,
    feePayer: feePayer,
  }).add(feeInstruction, transferInstruction));
}

export async function buildTransactionToCreateAccount(
  connection: Connection,
  feePayer: PublicKey,
  fee: TokenFee,
  mint: PublicKey,
  sender: PublicKey,
  recipient: PublicKey
): Promise<Transaction> {
  const feeInstruction = createTransferInstruction(
    await getAssociatedTokenAddress(mint, sender),
    new PublicKey(fee.account),
    sender,
    fee.fee
  );
  const accountInstruction = createAssociatedTokenAccountInstruction(
    feePayer,
    await getAssociatedTokenAddress(mint, recipient),
    recipient,
    mint
  );
  return (new Transaction({
    recentBlockhash: (await connection.getRecentBlockhashAndContext()).value.blockhash,
    feePayer: feePayer,
  }).add(feeInstruction, accountInstruction));
}
