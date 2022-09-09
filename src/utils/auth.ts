import jwt, {JwtPayload} from "jsonwebtoken";
import {NextApiRequest} from "next";

export function getTokenPayloadFromHeaders(request: NextApiRequest): JwtPayload | null {
  const authorization = request.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  const token = authorization.slice('Bearer '.length);

  try {
    return jwt.verify(
      token,
      process.env.AUTHO_CERTIFICATE,
      { algorithms: ['RS256'] }
    ) as JwtPayload;
  } catch (e) {
    return null;
  }
}
