import {FC, useCallback, useEffect, useState} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import useOctaneConfigStore from "../stores/useOctaneConfigStore";
import {TokenAmountInput} from "../components/TokenAmountInput";
import {SubmitButton} from "../components/SubmitButton";
import {OctaneFeesInfo} from "../components/OctaneFeesInfo";
import {MintInput} from "../components/MintInput";
import {
  buildWhirlpoolsSwapTransaction,
  sendWhirlpoolsSwapTransaction
} from "../utils/octane";
import {notify} from "../utils/notifications";
import {Title} from "../components/Title";

export const SwapView: FC = ({ }) => {
  const { publicKey, signTransaction  } = useWallet();

  const octaneConfig = useOctaneConfigStore((s) => s.config);
  const { fetchOctaneConfig, getSwapFeeConfig } = useOctaneConfigStore();
  useEffect(fetchOctaneConfig, [fetchOctaneConfig]);

  const [mint, setMint] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");

  const submitSwap = useCallback(async () => {
    const feeConfig = getSwapFeeConfig( mint);
    const mintAsPublicKey = new PublicKey(mint);
    const amountAsDecimals = Math.floor(parseFloat(amount) * (10 ** feeConfig.decimals));

    // TODO: Preview quote
    const {transaction, messageToken} = await buildWhirlpoolsSwapTransaction(
      publicKey, mintAsPublicKey, amountAsDecimals
    );
    const signedTransaction = await signTransaction(transaction);
    const txid = await sendWhirlpoolsSwapTransaction(signedTransaction, messageToken);

    notify({ type: 'success', message: 'Swap is successful!', txid: txid });

  }, [getSwapFeeConfig, mint, amount, publicKey, signTransaction]);

  const enableSubmit = mint !== null && amount !== '';

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <Title text={"Gasless Swap to SOL"} />
        { octaneConfig && (
          <div className="text-center flex flex-col space-y-1">
            <MintInput
              currentMint={mint}
              onChange={e => {
                setMint(e.target.value);
              }}
              availableMints={octaneConfig.endpoints.whirlpoolsSwap.tokens.map(tokenFee => tokenFee.mint)}
            />
            <TokenAmountInput currentAmount={amount} onChange={(e) => setAmount(e.target.value)} />
            { enableSubmit && (
              <OctaneFeesInfo fees={[{name: 'Transaction fees', fee: getSwapFeeConfig(mint)}]} />
            )}
            <SubmitButton
              onClick={submitSwap}
              disabled={!enableSubmit}
              text={"Send transaction"}
              disabledText={"Select mint"}
            />
          </div>
        )}
      </div>
    </div>
  );
};
