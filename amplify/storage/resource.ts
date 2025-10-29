import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "afcsResourceStorage",
  access: (allow) => ({
    "private/{entity_id}/*": [
      allow.authenticated.to(["read", "write", "delete"]),
    ],
    "protected/{entity_id}/*": [
      allow.authenticated.to(["read", "write", "delete"]),
      allow.groups(["ADMIN"]).to(["read"]),
    ],
    "public/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read"]),
    ],
  }),
});
