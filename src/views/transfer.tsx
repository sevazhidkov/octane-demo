import {FC, useCallback, useEffect} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {
  createAssociatedTokenAccount,
  sendTransactionWithTokenFee,
  buildTransactionToTransfer,
  buildTransactionToCreateAccount
} from "../utils/octane";
import {PublicKey} from "@solana/web3.js";
import useOctaneConfigStore from "../stores/useOctaneConfigStore";
import useTransferFormStore, { ATAState } from "../stores/useTransferFormStore";
import {OctaneFeesInfo} from "../components/OctaneFeesInfo";
import {RecipientWalletAddressInput} from "../components/RecipientWalletAddressInput";
import {MintInput} from "../components/MintInput";
import {TokenAmountInput} from "../components/TokenAmountInput";
import {SubmitButton} from "../components/SubmitButton";
import {notify} from "../utils/notifications";
import {Title} from "../components/Title";

const EXAMPLE_RECIPIENT = 'BAmWtkoKG64rpeUvgN37NVUz3SGYdu8f16PvpM2waK3v';

export const TransferView: FC = ({ }) => {
  const { publicKey, signTransaction  } = useWallet();
  const { connection } = useConnection();

  // todo: validate balance of wallet in tokens
  // todo: do not let to input arbitrary strings into amount
  // todo: handle errors via notify

  const octaneConfig = useOctaneConfigStore((s) => s.config);
  const feePayer = useOctaneConfigStore((s) => s.config ? new PublicKey(s.config.feePayer) : null);
  const { fetchOctaneConfig, getTransferFeeConfig, getATAFeeConfig } = useOctaneConfigStore();
  useEffect(fetchOctaneConfig, [fetchOctaneConfig]);

  const mint = useTransferFormStore((s) => s.mint);
  const address = useTransferFormStore((s) => s.address);
  const amount = useTransferFormStore((s) => s.amount);
  const accountState = useTransferFormStore((s) => s.accountState);
  const { setMint, setAddress, setAmount, updateAccountState } = useTransferFormStore();

  const submitTransfer = useCallback(async () => {
    const mintAsPublicKey = new PublicKey(mint);
    const addressAsPublicKey = new PublicKey(address);

    const ATAFeeConfig = getATAFeeConfig( mint);
    const transferFeeConfig = getTransferFeeConfig(mint);

    if (accountState === ATAState.not_created) {
      const accountTransaction = await buildTransactionToCreateAccount(
        connection,
        feePayer,
        ATAFeeConfig,
        mintAsPublicKey,
        publicKey,
        addressAsPublicKey,
      );
      const signedAccountTransaction = await signTransaction(accountTransaction);
      const accountTxId = await createAssociatedTokenAccount(signedAccountTransaction);
      notify({ type: 'success', message: 'Associated token account created!', txid: accountTxId });
    }

    const transferTransaction = await buildTransactionToTransfer(
      connection,
      feePayer,
      transferFeeConfig,
      mintAsPublicKey,
      publicKey,
      addressAsPublicKey,
      Math.floor(parseFloat(amount) * (10 ** transferFeeConfig.decimals))
    );
    const signedTransferTransaction = await signTransaction(transferTransaction);
    const transferTxId = await sendTransactionWithTokenFee(signedTransferTransaction);
    notify({ type: 'success', message: 'Transfer is successful!', txid: transferTxId });
  }, [mint, address, accountState, connection, feePayer, publicKey, amount, signTransaction, getTransferFeeConfig, getATAFeeConfig]);

  const enableSubmit = publicKey && (accountState === ATAState.not_created || accountState === ATAState.created) && amount !== '';

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <Title text="Gasless Token Transfer" />
        { octaneConfig && (
          <div className="text-center flex flex-col space-y-1">
            <RecipientWalletAddressInput
              address={address}
              onChange={e => {
                setAddress(e.target.value);
                updateAccountState(connection);
              }}
              suggestion={EXAMPLE_RECIPIENT}
              onSuggestionClick={() => setAddress(EXAMPLE_RECIPIENT)}
            />
            <MintInput
              currentMint={mint}
              onChange={e => {
                setMint(e.target.value);
                updateAccountState(connection);
              }}
              availableMints={octaneConfig.endpoints.transfer.tokens.map(tokenFee => tokenFee.mint)}
            />
            <TokenAmountInput
              currentAmount={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            { accountState === ATAState.created && (
              <OctaneFeesInfo fees={[{name: 'Transaction fees', fee: getTransferFeeConfig(mint)}]}/>
            )}
            { accountState === ATAState.not_created && (
              <OctaneFeesInfo fees={[
                {name: 'Transaction fees', fee: getTransferFeeConfig(mint)},
                {name: 'Associated token account rent', fee: getATAFeeConfig(mint)},
              ]}/>
            )}

            <SubmitButton
              onClick={submitTransfer}
              disabled={!enableSubmit}
              text={"Send transaction"}
              disabledText={!publicKey ? "Connect wallet" : "Select mint and amount"}
            />
          </div>
        )}
      </div>
    </div>
  );
};
