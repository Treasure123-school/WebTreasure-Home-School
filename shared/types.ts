// shared/types.ts
import { z } from "zod";

export const insertAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Content is required"),
  audience: z.enum(['all', 'students', 'teachers', 'parents']).default('all'),
  createdBy: z.string().optional(),
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
