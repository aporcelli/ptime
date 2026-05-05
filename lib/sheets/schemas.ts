import { z } from "zod";

export const WorkspaceMemberRolSchema = z.enum(["OWNER", "COLABORADOR", "VIEWER"]);
export type WorkspaceMemberRolNormalized = z.infer<typeof WorkspaceMemberRolSchema>;

export const WorkspaceMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  sheet_id: z.string().trim().default(""),
  rol: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(WorkspaceMemberRolSchema)
    .catch("VIEWER"),
  invited_by: z.string().trim().default(""),
  created_at: z.string().trim().default(""),
  updated_at: z.string().trim().default(""),
});
