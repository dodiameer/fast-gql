import dotenv from "dotenv";
dotenv.config();
import { IS_DEV, PORT } from "$env";
import fastify from "fastify";
import { prisma } from "$plugins/prisma";
import { graphql } from "$plugins/graphql";

const app = fastify({
  logger: {
    prettyPrint: IS_DEV,
  },
});

app.register(prisma);
app.register(graphql);

const start = async () => {
  try {
    await app.listen(PORT);
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
};

start();
