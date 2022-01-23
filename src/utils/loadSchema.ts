import { IS_DEV } from "$env";
import { makeExecutableSchema } from "@graphql-tools/schema";
import fs from "fs";
import { GraphQLSchema } from "graphql";
import path from "path";
import { getResolvers } from "$utils/getResolvers";

let schema: GraphQLSchema;

export const loadSchema = async () => {
  if (!schema || IS_DEV) {
    const typeDefs = fs.readFileSync(
      path.resolve("src/schema.graphql"),
      "utf-8"
    );
    schema = makeExecutableSchema({
      typeDefs,
      resolvers: getResolvers(),
    });
  }
  return schema;
};
