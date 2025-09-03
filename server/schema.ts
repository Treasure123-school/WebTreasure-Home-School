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
  role_name: varchar("role_name").notNull().unique(), // ✅ FIXED: snake_case
});

// User storage table - MATCHING YOUR DATABASE
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  role_id: integer("role_id").references(() => roles.id).notNull(), // ✅ FIXED: snake_case
  full_name: text("full_name").notNull(), // ✅ FIXED: snake_case
  email: text("email").notNull().unique(),
  phone: text("phone"),
  gender: text("gender", { enum: ["Male", "Female"] }),
  dob: date("dob"),
  class: text("class"),
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

// Announcements - MATCHING YOUR DATABASE
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audience: text("audience", { enum: ["All", "Admin", "Teacher", "Student", "Parent"] }).default("All"),
  created_by: uuid("created_by").references(() => users.id, { onDelete: "set null" }), // ✅ FIXED: snake_case
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

// Gallery - MATCHING YOUR DATABASE
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  image_url: text("image_url").notNull(), // ✅ FIXED: snake_case
  caption: text("caption"),
  uploaded_by: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }), // ✅ FIXED: snake_case
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

// Exams - MATCHING YOUR DATABASE
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  class: text("class").notNull(),
  created_by: uuid("created_by").references(() => users.id, { onDelete: "set null" }), // ✅ FIXED: snake_case
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

// Questions - MATCHING YOUR DATABASE
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  exam_id: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }), // ✅ FIXED: snake_case
  question_text: text("question_text").notNull(), // ✅ FIXED: snake_case
  options: jsonb("options").notNull(),
  correct_answer: text("correct_answer").notNull(), // ✅ FIXED: snake_case
  marks: integer("marks").notNull().default(1),
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

// Exam Submissions - MATCHING YOUR DATABASE
export const examSubmissions = pgTable("exam_submissions", {
  id: serial("id").primaryKey(),
  exam_id: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }), // ✅ FIXED: snake_case
  student_id: uuid("student_id").references(() => users.id, { onDelete: "cascade" }), // ✅ FIXED: snake_case
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull().default(0),
  submitted_at: timestamp("submitted_at").defaultNow(), // ✅ FIXED: snake_case
  graded_by: uuid("graded_by").references(() => users.id, { onDelete: "set null" }), // ✅ FIXED: snake_case
});

// Enrollments - MATCHING YOUR DATABASE
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  child_name: text("child_name").notNull(), // ✅ FIXED: snake_case
  parent_name: text("parent_name").notNull(), // ✅ FIXED: snake_case
  parent_email: text("parent_email").notNull(), // ✅ FIXED: snake_case
  parent_phone: text("parent_phone").notNull(), // ✅ FIXED: snake_case
  child_age: integer("child_age").notNull(), // ✅ FIXED: snake_case
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

// Messages - MATCHING YOUR DATABASE
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

// Additional tables from your database schema
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  student_id: uuid("student_id").references(() => users.id, { onDelete: "cascade" }), // ✅ FIXED: snake_case
  date: date("date").notNull(),
  status: text("status", { enum: ["present", "absent", "late"] }).notNull(),
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  student_id: uuid("student_id").references(() => users.id, { onDelete: "cascade" }), // ✅ FIXED: snake_case
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "paid", "overdue"] }).default("pending"),
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  event_date: date("event_date").notNull(), // ✅ FIXED: snake_case
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

export const libraryResources = pgTable("library_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  file_url: text("file_url"), // ✅ FIXED: snake_case
  created_at: timestamp("created_at").defaultNow(), // ✅ FIXED: snake_case
});

// ... [KEEP ALL THE RELATIONS THE SAME] ...

// Schema types - UPDATE THESE TO USE snake_case FIELDS
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  created_at: true, // ✅ FIXED: snake_case
});
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export const insertGallerySchema = createInsertSchema(gallery).omit({
  id: true,
  created_at: true, // ✅ FIXED: snake_case
});
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof gallery.$inferSelect;

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  created_at: true, // ✅ FIXED: snake_case
});
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  created_at: true, // ✅ FIXED: snake_case
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const insertExamSubmissionSchema = createInsertSchema(examSubmissions).omit({
  id: true,
  submitted_at: true, // ✅ FIXED: snake_case
  score: true,
  graded_by: true, // ✅ FIXED: snake_case
});
export type InsertExamSubmission = z.infer<typeof insertExamSubmissionSchema>;
export type ExamSubmission = typeof examSubmissions.$inferSelect;

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  created_at: true, // ✅ FIXED: snake_case
  status: true,
});
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  created_at: true, // ✅ FIXED: snake_case
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ... [UPDATE ALL OTHER SCHEMAS WITH snake_case] ...
