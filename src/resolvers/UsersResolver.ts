import { QueryResolvers } from "$generated/graphql";

type Resolver = {
  Query: Pick<QueryResolvers, "users">;
};

export const UsersResolver: Resolver = {
  Query: {
    users: async (_, __, { prisma }) => {
      const users = await prisma.user.findMany();
      return users;
    },
  },
};
