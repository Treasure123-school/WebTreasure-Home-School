import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  pgEnum,
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

// Role enum
export const roleEnum = pgEnum('role', ['admin', 'teacher', 'student', 'parent']);

// User storage table - FIXED: Use consistent naming
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"), // camelCase in TS, snake_case in DB
  lastName: varchar("last_name"),   // camelCase in TS, snake_case in DB
  profileImageUrl: varchar("profile_image_url"), // camelCase in TS, snake_case in DB
  role: roleEnum("role").notNull().default('student'),
  phone: varchar("phone"),
  gender: varchar("gender"),
  dateOfBirth: timestamp("date_of_birth"), // camelCase in TS, snake_case in DB
  className: varchar("class_name"), // camelCase in TS, snake_case in DB
  createdAt: timestamp("created_at").defaultNow(), // camelCase in TS, snake_case in DB
  updatedAt: timestamp("updated_at").defaultNow(), // camelCase in TS, snake_case in DB
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  audience: varchar("audience").notNull().default('all'),
  createdBy: varchar("created_by").notNull().references(() => users.id), // camelCase in TS, snake_case in DB
  createdAt: timestamp("created_at").defaultNow(), // camelCase in TS, snake_case in DB
});

export const gallery = pgTable("gallery", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: varchar("image_url").notNull(), // camelCase in TS, snake_case in DB
  caption: text("caption"),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id), // camelCase in TS, snake_case in DB
  createdAt: timestamp("created_at").defaultNow(), // camelCase in TS, snake_case in DB
});

export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  subject: varchar("subject").notNull(),
  className: varchar("class_name").notNull(), // camelCase in TS, snake_case in DB
  duration: integer("duration").notNull().default(30),
  totalMarks: integer("total_marks").notNull().default(0), // camelCase in TS, snake_case in DB
  isActive: boolean("is_active").notNull().default(true), // camelCase in TS, snake_case in DB
  createdBy: varchar("created_by").notNull().references(() => users.id), // camelCase in TS, snake_case in DB
  createdAt: timestamp("created_at").defaultNow(), // camelCase in TS, snake_case in DB
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").notNull().references(() => exams.id, { onDelete: 'cascade' }), // camelCase in TS, snake_case in DB
  questionText: text("question_text").notNull(), // camelCase in TS, snake_case in DB
  options: jsonb("options").notNull(),
  correctAnswer: varchar("correct_answer").notNull(), // camelCase in TS, snake_case in DB
  marks: integer("marks").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(), // camelCase in TS, snake_case in DB
});

export const examSubmissions = pgTable("exam_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").notNull().references(() => exams.id), // camelCase in TS, snake_case in DB
  studentId: varchar("student_id").notNull().references(() => users.id), // camelCase in TS, snake_case in DB
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull().default(0),
  totalMarks: integer("total_marks").notNull().default(0), // camelCase in TS, snake_case in DB
  percentage: integer("percentage").notNull().default(0),
  submittedAt: timestamp("submitted_at").defaultNow(), // camelCase in TS, snake_case in DB
  gradedBy: varchar("graded_by").references(() => users.id), // camelCase in TS, snake_case in DB
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childName: varchar("child_name").notNull(), // camelCase in TS, snake_case in DB
  parentName: varchar("parent_name").notNull(), // camelCase in TS, snake_case in DB
  parentEmail: varchar("parent_email").notNull(), // camelCase in TS, snake_case in DB
  parentPhone: varchar("parent_phone").notNull(), // camelCase in TS, snake_case in DB
  childAge: integer("child_age").notNull(), // camelCase in TS, snake_case in DB
  status: varchar("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(), // camelCase in TS, snake_case in DB
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(), // camelCase in TS, snake_case in DB
});

// ... KEEP ALL RELATIONS AND SCHEMA TYPES THE SAME ...

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export const insertGallerySchema = createInsertSchema(gallery).omit({
  id: true,
  createdAt: true,
});
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof gallery.$inferSelect;

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true,
  totalMarks: true,
});
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const insertExamSubmissionSchema = createInsertSchema(examSubmissions).omit({
  id: true,
  submittedAt: true,
  score: true,
  totalMarks: true,
  percentage: true,
  gradedBy: true,
});
export type InsertExamSubmission = z.infer<typeof insertExamSubmissionSchema>;
export type ExamSubmission = typeof examSubmissions.$inferSelect;

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true,
  status: true,
});
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
