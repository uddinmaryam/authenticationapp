import z from "zod";

export const acceptMessage = z.object({
  acceptMessages: z.boolean(),
});
