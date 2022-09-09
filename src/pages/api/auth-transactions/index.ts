import type {NextApiRequest, NextApiResponse} from 'next';
import {getTokenPayloadFromHeaders} from "../../../utils/auth";
import {getRedisKeyForSignaturesCount, redisClient, feePayer, SIGNATURES_PER_USER} from "../../../utils/feePayer";

type Data = { feePayer: string, signaturesLeft: number } | { status: 'error', message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!redisClient.isReady) {
    await redisClient.connect();
  }

  const tokenPayload = getTokenPayloadFromHeaders(req);
  if (tokenPayload === null) {
    res.status(403).send({status: 'error', message: 'access denied'});
    return;
  }

  const signaturesCount = await redisClient.get(getRedisKeyForSignaturesCount(tokenPayload.sub));
  const signaturesLeft = Math.max(
    0,
    SIGNATURES_PER_USER - (signaturesCount !== null ? parseInt(signaturesCount) : 0),
  );

  res.status(200).json({feePayer: feePayer.publicKey.toBase58(), signaturesLeft});
}
