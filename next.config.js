/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    RECAPTCHA_KEY: process.env.RECAPTCHA_KEY,
  }
}

module.exports = nextConfig
