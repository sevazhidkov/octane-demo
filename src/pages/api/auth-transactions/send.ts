import base58 from 'bs58';
import type { NextApiRequest, NextApiResponse } from 'next';
import {sendAndConfirmRawTransaction, Transaction} from "@solana/web3.js";
import { core } from '@solana/octane-core';
import {
  redisClient, feePayer, connection, SIGNATURES_PER_USER,
  getRedisKeyForSignaturesCount, getRedisKeyForSignatureRecord,
} from "../../../utils/feePayer";
import {getTokenPayloadFromHeaders} from "../../../utils/auth";
import {createAssessment} from "../../../utils/reCaptcha";

type Data = { status: 'ok', txid: string } | { status: 'error', message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!redisClient.isReady) {
    await redisClient.connect();
  }

  const serialized = req.body?.transaction;
  if (typeof serialized !== 'string') {
    res.status(400).send({ status: 'error', message: 'request should contain transaction' });
    return;
  }

  const reCaptchaToken = req.body?.reCaptchaToken;
  if (typeof reCaptchaToken !== 'string') {
    res.status(400).send({ status: 'error', message: 'request should contain reCaptchaToken param'});
    return;
  }

  const reCaptchaAssessment = await createAssessment(
    process.env.RECAPTCHA_PROJECT_ID,
    process.env.RECAPTCHA_API_KEY,
    reCaptchaToken,
    process.env.RECAPTCHA_KEY,
    'sendTransaction'
  );
  console.log('reCaptchaAssessment', reCaptchaAssessment);
  if (!reCaptchaAssessment.tokenProperties.valid) {
    res.status(400).send({ status: 'error', message: 'invalid captcha token' });
    return;
  }
  // Learn about scores here: https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
  if (reCaptchaAssessment.riskAnalysis.score < 0.5) {
    res.status(400).send({ status: 'error', message: 'invalid captcha token' });
    return;
  }

  const tokenPayload = getTokenPayloadFromHeaders(req);
  if (tokenPayload === null) {
    res.status(403).send({ status: 'error', message: 'access denied' });
    return;
  }

  let transaction: Transaction;
  try {
    transaction = Transaction.from(base58.decode(serialized));
  } catch (e) {
    res.status(400).send({status: 'error', message: "can't decode transaction"});
    return;
  }

  let signature: string;
  try {
    signature = (await core.validateTransaction(
      connection,
      transaction,
      feePayer,
      2,
      5000,
    )).signature;
  } catch (e) {
    res.status(400).send({status: 'error', message: 'bad transaction'});
    return;
  }

  try {
    await core.validateInstructions(transaction, feePayer);
  } catch (e) {
    res.status(400).send({status: 'error', message: 'bad instructions'});
    return;
  }

  try {
    await connection.simulateTransaction(transaction);
  } catch (e) {
    res.status(400).send({status: 'error', message: 'simulation failed'});
    return;
  }

  if (!await redisClient.setNX(getRedisKeyForSignatureRecord(signature), Date.now().toString())) {
    res.status(400).send({status: 'error', message: 'already signed this transaction'});
    return;
  }

  const signaturesKey = getRedisKeyForSignaturesCount(tokenPayload.sub!);
  const signatures = await redisClient.incrBy(signaturesKey, transaction.signatures.length);
  if (signatures > SIGNATURES_PER_USER) {
    res.status(400).send({status: 'error', message: 'signatures per user limit exceeded'});
    await redisClient.decrBy(signaturesKey, transaction.signatures.length);
    return;
  }
  console.log(`${SIGNATURES_PER_USER - signatures} signatures left for ${tokenPayload.sub}`);

  transaction.addSignature(
    feePayer.publicKey,
    Buffer.from(base58.decode(signature))
  );

  const txid = await sendAndConfirmRawTransaction(
    connection,
    transaction.serialize(),
    {commitment: 'confirmed'}
  );

  res.status(200).json({ status: 'ok', txid });
}
