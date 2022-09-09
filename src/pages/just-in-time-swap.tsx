import type { NextPage } from "next";
import Head from "next/head";
import { JustInTimeSwap } from "../views";

const Swap: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Just In Time Swap</title>
        <meta
          name="description"
          content="Gasless swap to execute specific transactions using Octane"
        />
      </Head>
      <JustInTimeSwap />
    </div>
  );
};

export default Swap;
