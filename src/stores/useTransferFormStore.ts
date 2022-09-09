import create, { State } from 'zustand';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from "@solana/spl-token";

export enum ATAState {
  loading = 'loading',
  invalid = 'invalid',
  created = 'created',
  not_created = 'not_created',
}

interface TransferFormStore extends State {
  mint: string,
  address: string,
  amount: string,
  accountState: ATAState,
  setMint: (mint: string) => void,
  setAddress: (address: string) => void,
  setAmount: (amount: string) => void,
  updateAccountState: (connection: Connection) => void
}

const useTransferFormStore = create<TransferFormStore>((set, get) => ({
  mint: '',
  address: '',
  amount: '',
  accountState: ATAState.invalid,
  setMint: (mint: string) => set((state) => { state.mint = mint }),
  setAddress: (address: string) => set((state) => { state.address = address }),
  setAmount: (amount: string) => set((state) => { state.amount = amount }),
  updateAccountState: async (connection: Connection) => {
    if (get().mint === '' || get().address === '') {
      set((s) => { s.accountState = ATAState.invalid });
      return;
    }
    set((s) => { s.accountState = ATAState.loading });
    const mintAsPublicKey = new PublicKey(get().mint);
    let recipientAsPublicKey: PublicKey;
    try {
      recipientAsPublicKey = new PublicKey(get().address);
    } catch {
      set((s) => { s.accountState = ATAState.invalid });
      return;
    }
    let address: PublicKey;
    try {
      address = await getAssociatedTokenAddress(mintAsPublicKey, recipientAsPublicKey);
    } catch {
      set((s) => { s.accountState = ATAState.invalid });
      return;
    }
    const accountInfo = await connection.getAccountInfo(address);
    set((s) => { s.accountState = accountInfo !== null ? ATAState.created : ATAState.not_created });
  },
}));

export default useTransferFormStore;
