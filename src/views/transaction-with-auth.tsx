import base58 from 'bs58';
import {FC, useCallback, useEffect} from "react";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {Connection, PublicKey, Transaction} from "@solana/web3.js";
import {useAuth0} from '@auth0/auth0-react';
import {createMemoInstruction} from "@solana/spl-memo";
import axios from "axios";
import {SubmitButton} from "../components/SubmitButton";
import useFeePayerConfigStore from "../stores/useFeePayerConfigStore";
import {Title} from "../components/Title";
import {notify} from "../utils/notifications";
import {useGoogleReCaptcha} from "react-google-recaptcha-v3";

async function buildTransaction(
  connection: Connection,
  feePayer: PublicKey,
  user: PublicKey,
): Promise<Transaction> {
  const feeInstruction = createMemoInstruction(
    'hello octane!',
    [user]
  )
  return (new Transaction({
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    feePayer: feePayer,
  }).add(feeInstruction));
}

export const TransactionWithAuthView: FC = ({}) => {
  const {publicKey, signTransaction} = useWallet();
  const {connection} = useConnection();
  const {executeRecaptcha} = useGoogleReCaptcha();

  // fixme: check that wallet is available
  // todo: handle errors

  const {
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();

  const feePayerPublicKey = useFeePayerConfigStore((s) => s.feePayerPublicKey);
  const signaturesLeft = useFeePayerConfigStore((s) => s.signaturesLeft);
  const {fetchFeePayerConfig} = useFeePayerConfigStore();

  const fetchConfigWithToken = useCallback(async () => {
    await fetchFeePayerConfig(await getAccessTokenSilently());
  }, [fetchFeePayerConfig, getAccessTokenSilently]);
  useEffect(
    () => {
      if (isAuthenticated && feePayerPublicKey === null) {
        fetchConfigWithToken();
      }
    },
    [feePayerPublicKey, fetchConfigWithToken, fetchFeePayerConfig, getAccessTokenSilently, isAuthenticated]
  );

  const submitTransaction = useCallback(async () => {
    const transaction = await buildTransaction(
      connection,
      feePayerPublicKey,
      publicKey,
    );
    const token = await executeRecaptcha('submitTransaction');
    await signTransaction(transaction);
    await axios.post('/api/auth-transactions/send', {
      transaction: base58.encode(transaction.serialize({requireAllSignatures: false})),
      reCaptchaToken: token,
    }, {
      headers: {
        'Authorization': `Bearer ${await getAccessTokenSilently()}`
      }
    });

    notify({type: 'success', message: 'Transaction is submitted!'});

    await fetchConfigWithToken();
  }, [connection, feePayerPublicKey, publicKey, signTransaction, getAccessTokenSilently, fetchConfigWithToken, executeRecaptcha]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <Title text="Sponsored Transaction"/>
        {/* CONTENT GOES HERE */}
        <div className="text-center">
          <div>
            {isAuthenticated && executeRecaptcha && signaturesLeft !== null && signaturesLeft > 0 && (
              <>
                <div>{signaturesLeft} signatures left</div>
                <SubmitButton onClick={submitTransaction} text={'Send transaction'} disabled={!publicKey}
                              disabledText={'Connect wallet'}/>
              </>
            )}
            {isAuthenticated && signaturesLeft === 0 && (
              <div>No signatures left</div>
            )}
            {}
            {!isAuthenticated && (
              <SubmitButton onClick={loginWithRedirect} text={'Login'}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
