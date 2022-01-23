import { getEnveloped } from "$utils/getEnveloped";
import fp from "fastify-plugin";
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  sendResult,
  shouldRenderGraphiQL,
} from "graphql-helix";

export const graphql = fp(async (fastify) => {
  fastify.route({
    method: ["GET", "POST"],
    url: "/graphql",
    handler: async (request, reply) => {
      if (shouldRenderGraphiQL(request)) {
        reply
          .header("Content-Type", "text/html")
          .send(renderGraphiQL({ defaultQuery: "# Write your query here\n" }));
        return;
      }

      const result = await processRequest({
        request,
        ...getGraphQLParameters(request),
        ...getEnveloped({ request, reply, prisma: request.prisma }),
      });

      sendResult(result, reply.raw);
      reply.sent = true;
      return;
    },
  });
});
