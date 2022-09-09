// Store specifically for fully sponsored transaction via /auth-transactions/ endpoints
import create, {State} from "zustand";
import {PublicKey} from "@solana/web3.js";
import axios from "axios";

interface FeePayerConfigStore extends State {
  feePayerPublicKey: PublicKey | null;
  signaturesLeft: number | null;

  fetchFeePayerConfig(token: string): void;
}

const useFeePayerConfigStore = create<FeePayerConfigStore>((set) => ({
  feePayerPublicKey: null,
  signaturesLeft: null,
  fetchFeePayerConfig: async (token: string) => {
    const response = (
      await axios.get('/api/auth-transactions/', {headers: {'Authorization': `Bearer ${token}`}})
    ).data;
    set(s => {
      s.feePayerPublicKey = new PublicKey(response.feePayer);
      s.signaturesLeft = response.signaturesLeft;
    });
  },
}));

export default useFeePayerConfigStore;
