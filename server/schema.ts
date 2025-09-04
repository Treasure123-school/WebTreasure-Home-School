import {
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  uuid,
  serial,
  date,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Roles Table (from your database)
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  role_name: varchar("role_name").notNull().unique(),
});

// ===== AUTHENTICATION TABLES =====

// Password authentication table
export const passwords = pgTable("passwords", {
  id: uuid("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// ===== UPDATED USERS TABLE =====
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  role_id: integer("role_id").references(() => roles.id).notNull(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  gender: text("gender", { enum: ["Male", "Female"] }),
  dob: date("dob"),
  class: text("class"),
  is_active: boolean("is_active").default(true), // ADDED
  last_login: timestamp("last_login"), // ADDED
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(), // ADDED
});

// Announcements - MATCHING YOUR DATABASE
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audience: text("audience", { enum: ["All", "Admin", "Teacher", "Student", "Parent"] }).default("All"),
  created_by: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").defaultNow(),
});

// Gallery - MATCHING YOUR DATABASE
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  image_url: text("image_url").notNull(),
  caption: text("caption"),
  uploaded_by: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").defaultNow(),
});

// Exams - MATCHING YOUR DATABASE
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  class: text("class").notNull(),
  created_by: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  created_at: timestamp("created_at").defaultNow(),
});

// Questions - MATCHING YOUR DATABASE
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  exam_id: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  question_text: text("question_text").notNull(),
  options: jsonb("options").notNull(),
  correct_answer: text("correct_answer").notNull(),
  marks: integer("marks").notNull().default(1),
  created_at: timestamp("created_at").defaultNow(),
});

// Exam Submissions - MATCHING YOUR DATABASE
export const examSubmissions = pgTable("exam_submissions", {
  id: serial("id").primaryKey(),
  exam_id: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  student_id: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull().default(0),
  submitted_at: timestamp("submitted_at").defaultNow(),
  graded_by: uuid("graded_by").references(() => users.id, { onDelete: "set null" }),
});

// Enrollments - MATCHING YOUR DATABASE
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  child_name: text("child_name").notNull(),
  parent_name: text("parent_name").notNull(),
  parent_email: text("parent_email").notNull(),
  parent_phone: text("parent_phone").notNull(),
  child_age: integer("child_age").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

// Messages - MATCHING YOUR DATABASE
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Additional tables from your database schema
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  student_id: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: text("status", { enum: ["present", "absent", "late"] }).notNull(),
  created_at: timestamp("createdated_at").defaultNow(),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  student_id: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "paid", "overdue"] }).default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  event_date: date("event_date").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

export const libraryResources = pgTable("library_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  file_url: text("file_url"),
  created_at: timestamp("created_at").defaultNow(),
});

// ===== RELATIONS =====

export const usersRelations = relations(users, ({ many }) => ({
  announcements: many(announcements),
  gallery: many(gallery),
  exams: many(exams),
  submissions: many(examSubmissions),
  attendance: many(attendance),
  fees: many(fees),
  passwords: many(passwords), // ADDED
  passwordResetTokens: many(passwordResetTokens), // ADDED
}));

export const passwordsRelations = relations(passwords, ({ one }) => ({
  user: one(users, {
    fields: [passwords.id],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.user_id],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, {
    fields: [announcements.created_by],
    references: [users.id],
  }),
}));

export const galleryRelations = relations(gallery, ({ one }) => ({
  uploader: one(users, {
    fields: [gallery.uploaded_by],
    references: [users.id],
  }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  creator: one(users, {
    fields: [exams.created_by],
    references: [users.id],
  }),
  questions: many(questions),
  submissions: many(examSubmissions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  exam: one(exams, {
    fields: [questions.exam_id],
    references: [exams.id],
  }),
}));

export const examSubmissionsRelations = relations(examSubmissions, ({ one }) => ({
  exam: one(exams, {
    fields: [examSubmissions.exam_id],
    references: [exams.id],
  }),
  student: one(users, {
    fields: [examSubmissions.student_id],
    references: [users.id],
  }),
  grader: one(users, {
    fields: [examSubmissions.graded_by],
    references: [users.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(users, {
    fields: [attendance.student_id],
    references: [users.id],
  }),
}));

export const feesRelations = relations(fees, ({ one }) => ({
  student: one(users, {
    fields: [fees.student_id],
    references: [users.id],
  }),
}));

// ===== SCHEMA TYPES =====

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertPassword = typeof passwords.$inferInsert;
export type Password = typeof passwords.$inferSelect;

export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const insertPasswordSchema = createInsertSchema(passwords, {
  password_hash: z.string().min(1),
}).omit({
  created_at: true,
  updated_at: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens, {
  user_id: z.string().uuid(),
  token: z.string().min(1),
  expires_at: z.date(),
}).omit({
  id: true,
  created_at: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements, {
  title: z.string().min(1),
  body: z.string().min(1),
  audience: z.enum(["All", "Admin", "Teacher", "Student", "Parent"]),
  created_by: z.string().uuid().optional().nullable(),
}).omit({
  id: true,
  created_at: true,
});
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export const insertGallerySchema = createInsertSchema(gallery, {
  image_url: z.string().url(),
  caption: z.string().optional().nullable(),
  uploaded_by: z.string().uuid().optional().nullable(),
}).omit({
  id: true,
  created_at: true,
});
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof gallery.$inferSelect;

export const insertExamSchema = createInsertSchema(exams, {
  title: z.string().min(1),
  subject: z.string().min(1),
  class: z.string().min(1),
  created_by: z.string().uuid().optional().nullable(),
}).omit({
  id: true,
  created_at: true,
});
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questions, {
  exam_id: z.number(),
  question_text: z.string().min(1),
  options: z.any(),
  correct_answer: z.string().min(1),
  marks: z.number().min(0),
}).omit({
  id: true,
  created_at: true,
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const insertExamSubmissionSchema = createInsertSchema(examSubmissions, {
  exam_id: z.number(),
  student_id: z.string().uuid(),
  answers: z.any(),
  score: z.number().default(0),
  graded_by: z.string().uuid().optional().nullable(),
}).omit({
  id: true,
  submitted_at: true,
});
export type InsertExamSubmission = z.infer<typeof insertExamSubmissionSchema>;
export type ExamSubmission = typeof examSubmissions.$inferSelect;

export const insertEnrollmentSchema = createInsertSchema(enrollments, {
  child_name: z.string().min(1),
  parent_name: z.string().min(1),
  parent_email: z.string().email(),
  parent_phone: z.string().min(1),
  child_age: z.number().min(0),
}).omit({
  id: true,
  created_at: true,
  status: true,
});
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export const insertMessageSchema = createInsertSchema(messages, {
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
}).omit({
  id: true,
  created_at: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const insertAttendanceSchema = createInsertSchema(attendance, {
  student_id: z.string().uuid(),
  date: z.date(),
  status: z.enum(["present", "absent", "late"]),
}).omit({
  id: true,
  created_at: true,
});
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export const insertFeeSchema = createInsertSchema(fees, {
  student_id: z.string().uuid(),
  amount: z.number(),
  status: z.enum(["pending", "paid", "overdue"]),
}).omit({
  id: true,
  created_at: true,
});
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Fee = typeof fees.$inferSelect;

export const insertEventSchema = createInsertSchema(events, {
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  event_date: z.date(),
}).omit({
  id: true,
  created_at: true,
});
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievements, {
  title: z.string().min(1),
  description: z.string().optional().nullable(),
}).omit({
  id: true,
  created_at: true,
});
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const insertLibraryResourceSchema = createInsertSchema(libraryResources, {
  title: z.string().min(1),
  author: z.string().optional().nullable(),
  file_url: z.string().url().optional().nullable(),
}).omit({
  id: true,
  created_at: true,
});
export type InsertLibraryResource = z.infer<typeof insertLibraryResourceSchema>;
export type LibraryResource = typeof libraryResources.$inferSelect;
