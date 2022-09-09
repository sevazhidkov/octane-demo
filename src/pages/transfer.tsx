import type { NextPage } from "next";
import Head from "next/head";
import { TransferView } from "../views";

const Transfer: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Transfer</title>
        <meta
          name="description"
          content="Gasless transfer using Octane"
        />
      </Head>
      <TransferView />
    </div>
  );
};

export default Transfer;
