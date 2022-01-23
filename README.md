# Fast GQL

A boilerplate for getting started building GraphQL APIs with Fastify & Typescript

## Features

- Uses `graphql-helix` & Envelop for a customizable server
- Typesafe resolvers with `graphql-codegen`
- User authentication with JWTs (Access & refresh tokens)
- Prisma as database ORM
- `graphql-jit` instead of normal GraphQL.js implementation for flying fast performance
- Masked errors, so only thrown `EnvelopError` errors will have their message exposed to the API consumer

## Usage

```bash
npx degit dodiameer/fast-gql <DESTINATION>
cd <DESTINATION>
yarn
cp .env.example .env # Make sure to edit the values too
yarn graphql:gen
yarn dev
```

## Project structure

- `src/plugins`: Fastify plugins
- `src/resolvers`: GraphQL resolvers (See [Writing Resolvers](#writing-resolvers))
- `src/utils`: Utility functions/files
- `src/generated`: Output of `graphql-codegen`
- `src/index.ts`: Server starting point
- `src/env.ts`: A place to export your used environment variables
- `src/types.ts`: A place to define types that will be imported in multiple files (**Not made automatically available, must be imported manually**)
- `src/schema.graphql`: The schema that will be used to generate resolvers with `graphql-codegen`

## Path/import aliases

To avoid nasty relative imports, there are some aliases defined under `paths` in `tsconfig.json`:

- `$utils`: `src/utils/`
- `$env`: `src/env.ts`
- `$plugins`: `src/plugins/`
- `$generated`: `src/generated/`
- `$resolvers`: `src/resolvers/`
- `$types`: `src/types.ts`

## Writing resolvers

**Note:** this is the _recommended_ way, and the one I use in my projects &mdash; you are not forced to use this, and you are even free to tear out `graphql-codegen` and replace it with your favorite method (e.g. Nexus, TypeGraphQL, etc.)

1. Define your type, queries and mutations in `schema.graphql`
1. If your dev server isn't running, run `yarn graphql:gen` in your terminal to generate the new types, otherwise the types will be generated automatically
1. Create `SomenameResolver.ts` in `src/resolvers`
1. Define a type called `Resolver` and set it to be picks out of the generated `QueryResolvers`, `MutationResolvers`, etc. (See example below)
1. Export a named export with the same name of the file with the type you defined above (e.g. `export SomenameResolver: Resolver = {...}`)
1. In `src/utils/getResolvers.ts`, import it and add it to the resolver array returned from the function

### Example

```graphql
# src/schema.graphql
type Todo {
  id: String!
  text: String!
  completed: Boolean!
}

# ...

type Query {
  todos: [Todo!]!
  # ...
}

type Mutation {
  createTodo(text: String!): Todo!
  toggleTodo(id: String!): Todo!
}
```

```ts
// src/resolvers/TodosResolver.ts
import { QueryResolvers, MutationResolvers } from "$generated/graphql"
import { Context } from "$types"

type Resolver = {
  Query: Pick<QueryResolvers<Context>, "todos">,
  Mutation: Pick<MutationResolver<Context>, "createTodo" | "toggleTodo">
}

// This is now typesafe and provides autocompletion
export const TodosResolver: Resolver = {
  Query: { ... },
  Mutation: { ... }
}
```

```ts
// src/utils/getResolvers.ts
import { TodosResolver } from "$resolvers/TodosResolver";
// Other resolver imports

export const getResolvers = () => [
  TodosResolver,
  // Other resolvers
];
```

## Contributing

I won't accept issues or pull requests on this &mdash; You're more than welcome to use it though! If you want to add a feature you feel is missing, you're also welcome to fork this repo and add to it.

## License

MIT
