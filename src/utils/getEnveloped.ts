import { Context } from "$types";
import {
  envelop,
  EnvelopError,
  useAsyncSchema,
  useMaskedErrors,
} from "@envelop/core";
import { useGenericAuth, ResolveUserFn } from "@envelop/generic-auth";
import { User } from "@prisma/client";
import { verifyToken } from "$utils/jwt";
import { loadSchema } from "$utils/loadSchema";
import { useGraphQlJit } from "@envelop/graphql-jit";

const resolveUserFn: ResolveUserFn<User, Context> = async (context) => {
  const token =
    context.request.headers?.authorization?.replace("Bearer ", "") || "";
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await context.prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
};

export const getEnveloped = envelop({
  plugins: [
    useAsyncSchema(loadSchema()),
    useMaskedErrors({
      errorMessage: "An error has occurred",
    }),
    useGenericAuth({
      resolveUserFn,
      validateUser: (user) => {
        if (!user) {
          throw new EnvelopError("Unauthorized");
        }
      },
      mode: "resolve-only",
    }),
    useGraphQlJit(),
  ],
});
