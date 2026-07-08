import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  ...(import.meta.env.DEV && { baseURL: "http://localhost:3000" }),
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          input: false,
          returned: true,
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
