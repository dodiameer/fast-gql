import type { PrismaClient, User } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

export type Context = {
  request: FastifyRequest;
  reply: FastifyReply;
  prisma: PrismaClient;
  validateUser: () => Promise<void>;
  currentUser: User;
};
