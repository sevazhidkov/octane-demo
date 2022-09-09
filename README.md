# Octane Demo App

Simple app to explore the capabilities of Octane and provide an integration example. 

The app is based on [dapp-scaffold](https://github.com/solana-labs/dapp-scaffold).

* `src/utils/octane.ts`  interacts with Octane node
* `src/views/transfer.tsx` allows to send a token transfer and create associated token account.
* `src/views/swap.tsx` swaps tokens to SOL.
* `src/views/just-in-time-swap.tsx` swaps tokens to get SOL for specific complex transactions like NFT mints and Anchor program interacitons.
* `src/views/transaction-with-auth.tsx` on client and `src/pages/api/auth-transactions/index.ts` on backend fully sponsor transactions for registered users.
