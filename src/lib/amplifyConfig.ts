import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json" assert { type: "json" };

let isConfigured = false;

export const configureAmplify = () => {
  if (!isConfigured) {
    Amplify.configure(outputs);
    isConfigured = true;
  }
};
