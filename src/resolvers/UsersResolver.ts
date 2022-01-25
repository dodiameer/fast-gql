import { MutationResolvers, QueryResolvers } from "$generated/graphql";
import { generateToken, TokenType, verifyToken } from "$utils/jwt";
import { EnvelopError } from "@envelop/core";
import argon2 from "argon2";

type Resolver = {
  Query: Pick<QueryResolvers, "me">;
  Mutation: Pick<
    MutationResolvers,
    "login" | "register" | "logout" | "refreshToken"
  >;
};

export const UsersResolver: Resolver = {
  Query: {
    me: async (_, __, { validateUser, currentUser }) => {
      await validateUser();
      return currentUser;
    },
  },
  Mutation: {
    login: async (
      _,
      { input: { username, password } },
      { prisma, setRefreshToken }
    ) => {
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

      setRefreshToken(generateToken(user, TokenType.REFRESH));
      return {
        user,
        accessToken: generateToken(user),
      };
    },
    register: async (
      _,
      { input: { username, password } },
      { prisma, setRefreshToken }
    ) => {
      try {
        const user = await prisma.user.create({
          data: {
            username,
            password: await argon2.hash(password),
          },
        });

        setRefreshToken(generateToken(user, TokenType.REFRESH));
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
    logout: (_, __, { clearRefreshToken }) => {
      clearRefreshToken();
      return true;
    },
    refreshToken: async (_, __, { refreshToken, prisma, setRefreshToken }) => {
      const payload = verifyToken(refreshToken || "");
      if (!payload) {
        throw new EnvelopError("Invalid token");
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new EnvelopError("Invalid token");
      }

      setRefreshToken(generateToken(user, TokenType.REFRESH));
      return {
        user,
        accessToken: generateToken(user),
      };
    },
  },
};
