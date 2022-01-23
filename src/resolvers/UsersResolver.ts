import { MutationResolvers, QueryResolvers } from "$generated/graphql";
import { Context } from "$types";
import { generateToken, verifyToken } from "$utils/jwt";
import { EnvelopError } from "@envelop/core";
import argon2 from "argon2";

type Resolver = {
  Query: Pick<QueryResolvers<Context>, "me">;
  Mutation: Pick<MutationResolvers<Context>, "login" | "register">;
};

export const UsersResolver: Resolver = {
  Query: {
    me: async (_, __, { request, prisma }) => {
      // TODO Use envelop's auth middleware
      const token =
        request.headers?.authorization?.replace("Bearer ", "") || "";
      const payload = verifyToken(token);
      if (!payload) {
        throw new EnvelopError("Unauthorized");
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new EnvelopError("Unauthorized");
      }

      return user;
    },
  },
  Mutation: {
    login: async (_, { input: { username, password } }, { prisma }) => {
      const INCORRECT = new EnvelopError("Username or password is incorrect");
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw INCORRECT;
      }

      const isValid = await argon2.verify(user.password, password);
      if (!isValid) {
        throw INCORRECT;
      }

      return {
        user,
        accessToken: generateToken(user),
      };
    },
    register: async (_, { input: { username, password } }, { prisma }) => {
      try {
        const user = await prisma.user.create({
          data: {
            username,
            password: await argon2.hash(password),
          },
        });

        return {
          user,
          accessToken: generateToken(user),
        };
      } catch (e) {
        if ((e as any).code === "P2002") {
          throw new EnvelopError("Username is already taken");
        }
        throw e;
      }
    },
  },
};
