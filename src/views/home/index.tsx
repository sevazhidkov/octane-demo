// Next, React
import {FC} from 'react';
import Link from 'next/link';

// Wallet
import {SubmitButton} from "../../components/SubmitButton";

export const HomeView: FC = ({}) => {
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1
          className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Gasless transactions on Solana
        </h1>
        <p className="md:w-full text-slate-300 my-2 max-w-2xl">
          <a href={"https://github.com/solana-labs/octane"}>⛽ Octane</a> allows to pay transaction
          fees through alternative methods.
          It{"'"}s&nbsp;designed to onboard new wallets without any funds or stablecoin-only wallets without&nbsp;SOL.
        </p>
        <ul className="md:w-full text-slate-300 my-2 max-w-2xl list-disc pl-4">
          <li>
            Pay transaction fees and associated account initialization fees with liquid SPL tokens. <span
            className={'text-blue-400 hover:underline'}><Link href={'/transfer'}>Gasless transfer example.</Link></span>
          </li>
          <li>
            Swap SPL tokens to SOL without any SOL
            on the balance. <span className={'text-blue-400 hover:underline'}><Link href={'/swap'}>Swap example.</Link></span>
            <span className={'text-blue-400 hover:underline'}><Link href={'/just-in-time-swap'}>Just-in-time swap example</Link></span> to
            get SOL for complex
            transactions like NFT mints and interactions with Anchor programs.
          </li>
          <li>Sponsor selected transactions for your users or let them pay transaction fees in your own token. <span
            className={'text-blue-400 hover:underline'}><Link href={'/transaction-with-auth'}>Sponsored transaction example.</Link></span>
          </li>
        </ul>
        <SubmitButton text={'View demo code'}
                      onClick={() => window.open("https://github.com/sevazhidkov/octane-demo")}/>
      </div>
    </div>
  );
};
