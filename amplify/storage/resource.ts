import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "documents",
  access: (allow) => ({
    "passport-photos/*": [allow.authenticated.to(["read", "write"])],
    "medical-records/*": [
      allow.groups(["ADMIN"]).to(["read", "write"]),
      allow.owner().to(["read", "write"]),
    ],
    "course-resources/*": [
      allow.authenticated.to(["read", "write"]),
    ],
  }),
});
