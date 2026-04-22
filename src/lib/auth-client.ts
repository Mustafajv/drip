import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  ...(import.meta.env.DEV && { baseURL: "http://localhost:3000" }),
});

export const { signIn, signUp, signOut, useSession } = authClient;
