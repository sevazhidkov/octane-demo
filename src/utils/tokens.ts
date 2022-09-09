import { Connection, PublicKey } from "@solana/web3.js";
import { deprecated } from "@metaplex-foundation/mpl-token-metadata";

export const CACHED_MINT_TO_NAME = {
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC (USD Coin)",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT (USDT)",
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL (Marinade staked SOL (mSOL))",
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj": "stSOL (Lido Staked SOL)",
  "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ": "DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ",
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": "WETH (Wrapped Ether (Wormhole))",
  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E": "BTC (Wrapped Bitcoin (Sollet))",
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": "RAY (Raydium)",
  "A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM": "USDC (USD Coin (Wormhole))",
  "zebeczgi5fSEtbpfQKVZKCJ3WgYXxjkMUkNNx7fLKAF": "ZBC (ZEBEC)",
  "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX": "USDH (Hubble)",
  "USDrbBQwQbQ2oWHUPfA8QBHcyVxKUq1xHyXsSLKdUq2": "USDrbBQwQbQ2oWHUPfA8QBHcyVxKUq1xHyXsSLKdUq2",
  "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds": "FoRGERiW7odcCBGU1bztZi16osPBHjxharvDathL5eds",
  "9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6": "9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6",
  "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE": "ORCA (Orca)",
  "CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5": "renBTC (renBTC)",
  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU": "SAMO (Samoyed Coin)",
  "6naWDMGNWwqffJnnXFLBCLaYu1y5U9Rohe5wwJPHvf1p": "SCRAP",
  "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y": "SHDW (Shadow Token)",
  "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm": "scnSOL (Socean staked SOL)",
  "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt": "SRM (Serum)",
  "Gz7VkD4MacbEB6yC5XD3HcumEiYx2EtDYYrfikGsvopG": "WMATIC (Wrapped Matic (Wormhole))",
  "7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx": "GMT",
  "HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332p": "LDO (Lido DAO Token (Wormhole))",
  "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk": "ETH (Wrapped Ethereum (Sollet))",
  "kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6": "KIN (KIN)",
  "AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB": "GST",
  "CKaKtYvz6dKPyMvYq9Rh3UBrnNqYZAyd7iF4hJtjUvks": "Gari"
};

export async function loadMintToName(connection: Connection, mints: PublicKey[]): Promise<{ [key: string]: string; }> {
  let result: { [key: string]: string; } = {};
  for (const mint of mints) {
    try {
      const data = (await deprecated.Metadata.findByMint(connection, mint)).data!.data;
      result[mint.toString()] = `${data.symbol} (${data.name})`;
    } catch {
      result[mint.toString()] = mint.toString();
    }
  }
  return result;
}
