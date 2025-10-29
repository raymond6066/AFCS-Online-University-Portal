import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginMechanisms: ["email"],
  signupAttributes: ["email"],
  userAttributes: {
    email: { required: true },
  },
  mfa: {
    status: "OPTIONAL",
  },
  oauth: {
    domainPrefix: "afcs-uni-erp",
    scopes: ["email", "openid", "profile"],
    redirectSignIn: [
      "http://localhost:3000/",
      "https://your-production-domain.com/",
    ],
    redirectSignOut: [
      "http://localhost:3000/",
      "https://your-production-domain.com/",
    ],
  },
});
