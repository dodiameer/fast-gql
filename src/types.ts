import type { PrismaClient } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

export type Context = {
  request: FastifyRequest;
  reply: FastifyReply;
  prisma: PrismaClient;
};
