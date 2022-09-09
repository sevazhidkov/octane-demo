import type { NextPage } from "next";
import Head from "next/head";
import { TransactionWithAuthView } from "../views";

const TransactionWithAuth: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Transaction with Auth</title>
        <meta
          name="description"
          content="Transaction with Auth"
        />
      </Head>
      <TransactionWithAuthView />
    </div>
  );
};

export default TransactionWithAuth;
