import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import jwt from "jsonwebtoken";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // First try Bearer token auth (JWT)
  const authHeader = opts.req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      user = await db.getUserById(decoded.userId);
    } catch (error) {
      user = null;
    }
  }

  // Fall back to session cookie auth if no Bearer token
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
