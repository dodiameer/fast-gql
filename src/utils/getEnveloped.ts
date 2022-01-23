import { envelop, useAsyncSchema, useMaskedErrors } from "@envelop/core";
import { loadSchema } from "./loadSchema";

export const getEnveloped = envelop({
  plugins: [
    useAsyncSchema(loadSchema()),
    useMaskedErrors({
      errorMessage: "An error has occurred",
    }),
  ],
});
