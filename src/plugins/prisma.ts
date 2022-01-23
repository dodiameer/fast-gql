import pkg from "@prisma/client";
import fp from "fastify-plugin";
const { PrismaClient } = pkg;
type PrismaClientType = InstanceType<typeof PrismaClient>;

declare module "fastify" {
  interface FastifyRequest {
    prisma: PrismaClientType;
  }
}

export const prisma = fp(async (fastify) => {
  fastify.addHook("onRequest", async (request, _reply) => {
    request.prisma = new PrismaClient();
    return;
  });

  fastify.addHook("onResponse", async (request, _reply) => {
    await request.prisma.$disconnect();
    return;
  });
});
