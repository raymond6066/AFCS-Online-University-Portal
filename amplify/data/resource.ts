import { type ClientSchema, defineData } from "@aws-amplify/backend";
import schema from "./schema.graphql";

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 7,
    },
  },
});
