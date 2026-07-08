import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.js";

const publicBaseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : "http://localhost:3000");

export const auth = betterAuth({
  baseURL: publicBaseURL,

  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        returned: true,
        defaultValue: "CUSTOMER",
      },
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:5174",
    publicBaseURL,
  ],
});
