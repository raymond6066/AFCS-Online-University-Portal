import type { PostConfirmationTriggerEvent, Context } from "aws-lambda";

export const handler = async (
  event: PostConfirmationTriggerEvent,
  _context: Context
): Promise<PostConfirmationTriggerEvent> => {
  // Placeholder for provisioning logic if needed. Developers can add
  // custom role-assignment or data seeding here.
  return event;
};
