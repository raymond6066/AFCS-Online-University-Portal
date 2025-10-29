import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: false,
    },
    "custom:role": {
      dataType: "String",
      mutable: true,
    },
  },
  triggers: {
    postConfirmation: {
      handler: "./triggers/post-confirmation.ts",
    },
  },
  oauth: {
    domainPrefix: "afcs-uni-erp",
    redirectSignIn: ["http://localhost:3000/"],
    redirectSignOut: ["http://localhost:3000/"],
    responseType: "code",
    scopes: [
      "email",
      "openid",
      "profile",
      "aws.cognito.signin.user.admin",
    ],
  },
});
