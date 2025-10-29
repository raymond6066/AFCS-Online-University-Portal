"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "./schema";

export const client = generateClient<Schema>();
