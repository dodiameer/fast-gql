import { IS_PROD } from "$env";
import { Context } from "$types";
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

      const envelop = getEnveloped<
        Omit<Context, "currentUser" | "validateUser">
      >({
        request,
        reply,
        prisma: request.prisma,
        refreshToken: request.cookies.refreshToken,
        setRefreshToken: (token) => {
          reply.cookie("refreshToken", token, {
            path: "/",
            httpOnly: true,
            secure: IS_PROD,
            // 7 Days
            maxAge: 60 * 60 * 24 * 7,
          });
        },
        clearRefreshToken: () => {
          reply.clearCookie("refreshToken", {
            path: "/",
            httpOnly: true,
            secure: IS_PROD,
            maxAge: 60 * 60 * 24 * 7,
          });
        },
      });

      const result = await processRequest({
        request,
        ...getGraphQLParameters(request),
        ...envelop,
      });

      if (result.type === "RESPONSE") {
        reply.status(result.status);
        reply.send(result.payload);
        return;
      }

      sendResult(result, reply.raw);
      reply.sent = true;
      return;
    },
  });
});
