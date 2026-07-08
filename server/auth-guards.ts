import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { UserRole } from "../generated/prisma/enums.js";
import { auth } from "./auth.js";
import { prisma } from "./db.js";

type AuthedUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
};

type RequestWithUser = Request & {
  user?: AuthedUser;
};

export function getAuthedUser(req: Request) {
  return (req as RequestWithUser).user;
}

async function getRequestUser(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getRequestUser(req);

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    (req as RequestWithUser).user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getRequestUser(req);

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    (req as RequestWithUser).user = user;
    next();
  } catch (error) {
    next(error);
  }
}
