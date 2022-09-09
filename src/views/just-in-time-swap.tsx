import {FC, useCallback, useEffect, useState} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {Keypair, PublicKey} from "@solana/web3.js";
import {Metaplex, walletAdapterIdentity} from "@metaplex-foundation/js";
import {GokiSDK} from "@gokiprotocol/client";
import BN from "bn.js";
import {SolanaProvider} from "@saberhq/solana-contrib";
import useOctaneConfigStore from "../stores/useOctaneConfigStore";
import {SubmitButton} from "../components/SubmitButton";
import {MintInput} from "../components/MintInput";
import {buildWhirlpoolsSwapTransaction, sendWhirlpoolsSwapTransaction} from "../utils/octane";
import {notify} from "../utils/notifications";
import {Title} from "../components/Title";

export const JustInTimeSwap: FC = ({}) => {
  const wallet = useWallet();
  const {connection} = useConnection();

  const {publicKey, sendTransaction, signTransaction} = wallet;

  const octaneConfig = useOctaneConfigStore((s) => s.config);
  const {fetchOctaneConfig} = useOctaneConfigStore();
  useEffect(fetchOctaneConfig, [fetchOctaneConfig]);

  const [mint, setMint] = useState<string | null>(null);

  // You can make it even smarter by scanning through user's tokens and selecting the ones they can use for payments
  // Also, user might already have SOL - so just-in-time-swap will be redundant
  const justInTimeSwap = useCallback(async (lamports: number) => {
    const mintAsPublicKey = new PublicKey(mint)
    // First request to estimate the price:
    const testAmount = 100000;
    const {quote} = await buildWhirlpoolsSwapTransaction(
      publicKey, mintAsPublicKey, testAmount
    );
    const pricePerLamportInTokenDecimals = (
      (new BN(quote.estimatedAmountIn, 'hex').toNumber()) /
      (new BN(quote.estimatedAmountOut, 'hex').toNumber())
    );

    // get a bit more sol than needed to cover slippage and rent exemption  for sol account
    const requiredAmount = Math.floor(
      (lamports + await connection.getMinimumBalanceForRentExemption(0)) * pricePerLamportInTokenDecimals
      * 1.02
    );

    // Octane server requires a timeout between requests
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await sleep(3000);

    // This time, let's actually swap!
    const {transaction, messageToken} = await buildWhirlpoolsSwapTransaction(
      publicKey, mintAsPublicKey, requiredAmount
    );
    const signedTransaction = await signTransaction(transaction);
    const txid = await sendWhirlpoolsSwapTransaction(signedTransaction, messageToken);

    notify({ type: 'success', message: 'Just-in-time swap is successful, moving to the main transaction!', txid: txid });
  }, [connection, mint, publicKey, signTransaction]);

  const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));
  const mintNFT = useCallback(async () => {
    await justInTimeSwap(11981200); // amount of lamports for the following transaction

    // random collection with a bunch of available items and price=0:
    const candyMachineId = new PublicKey('3j2tkZEAiE8p1i8Uv4B6a5hYCGZCBNh4qATeyRahiHsn');

    const candyMachine = await metaplex.candyMachines().findByAddress({address: candyMachineId}).run();
    await metaplex.candyMachines().mint({candyMachine}).run();

    notify({ type: 'success', message: 'Mint is successful!'});
  }, [justInTimeSwap, metaplex]);

  const runAnchorTransaction = useCallback(async () => {
    await justInTimeSwap(3183760); // amount of lamports for the following transaction

    const owner1 = Keypair.generate();
    const owner2 = Keypair.generate();
    const owner3 = Keypair.generate();
    const provider = SolanaProvider.init({
      connection,
      broadcastConnections: [connection],
      wallet
    });
    const gokiSDK = GokiSDK.load({provider});
    const {tx} = await gokiSDK.newSmartWallet({
      numOwners: 3,
      owners: [owner1.publicKey, owner2.publicKey, owner3.publicKey],
      threshold: new BN(2)
    });
    const transaction = tx.build(publicKey);
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(tx.signers[0]);
    const txid = await sendTransaction(transaction, connection);
    notify({ type: 'success', message: 'Transaction is successful!', txid});
  }, [connection, justInTimeSwap, publicKey, sendTransaction, wallet]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <Title text={"Just-in-time Gasless Swap"} />
        {octaneConfig && (
          <div className="text-center flex flex-col space-y-1">
            <MintInput
              currentMint={mint}
              onChange={e => setMint(e.target.value)}
              availableMints={octaneConfig.endpoints.whirlpoolsSwap.tokens.map(token => token.mint)}
            />
            <SubmitButton onClick={mintNFT} text={'Mint'} disabled={!publicKey}
                          disabledText={'Connect wallet to mint'}/>
            <SubmitButton onClick={runAnchorTransaction} text={'Create a Goki wallet'} disabled={!publicKey}
                          disabledText={'Connect wallet to run'}/>
          </div>
        )}
      </div>
    </div>
  );
};
