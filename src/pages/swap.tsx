import type { NextPage } from "next";
import Head from "next/head";
import { SwapView } from "../views";

const Swap: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Swap</title>
        <meta
          name="description"
          content="Gasless swap using Octane"
        />
      </Head>
      <SwapView />
    </div>
  );
};

export default Swap;
