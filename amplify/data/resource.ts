import { defineData } from "@aws-amplify/backend";
import schema from "../schema.graphql";

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
