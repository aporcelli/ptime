import { z } from "zod";

export const userUpsertSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  email: z.string().email(),
  sheetId: z.string().min(1),
});
