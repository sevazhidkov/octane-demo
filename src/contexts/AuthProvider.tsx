import {FC, ReactNode} from "react";
import {Auth0Provider} from "@auth0/auth0-react";

export const AuthProvider: FC<{ children: ReactNode }> = (
  { children }
) => {
  let protocol: string = '';
  let hostname: string = '';
  if (typeof window !== 'undefined') {
    protocol = window.location.protocol;
    hostname = window.location.host;
  }

  return <Auth0Provider
    domain={process.env.AUTH0_DOMAIN}
    clientId={process.env.AUTH0_CLIENT_ID}
    redirectUri={protocol + '//' + hostname + '/transaction-with-auth'}
    audience={process.env.AUTH0_AUDIENCE}
  >
    {children}
  </Auth0Provider>;
}
