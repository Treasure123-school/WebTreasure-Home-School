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
  uuid,
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
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  role_name: varchar("role_name").notNull().unique(),
});

// User storage table - MATCHING YOUR DATABASE
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  role_id: integer("role_id").references(() => roles.id),
  full_name: varchar("full_name").notNull(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone"),
  gender: varchar("gender"),
  dob: timestamp("dob"),
  class: varchar("class"),
  created_at: timestamp("created_at").defaultNow(),
});

// Announcements - MATCHING YOUR DATABASE
export const announcements = pgTable("announcements", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  audience: varchar("audience").notNull().default('All'),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Gallery - MATCHING YOUR DATABASE
export const gallery = pgTable("gallery", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  image_url: varchar("image_url").notNull(),
  caption: text("caption"),
  uploaded_by: uuid("uploaded_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Exams - MATCHING YOUR DATABASE
export const exams = pgTable("exams", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: varchar("title").notNull(),
  subject: varchar("subject").notNull(),
  class: varchar("class").notNull(),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Questions - MATCHING YOUR DATABASE
export const questions = pgTable("questions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  exam_id: integer("exam_id").references(() => exams.id, { onDelete: 'cascade' }),
  question_text: text("question_text").notNull(),
  options: jsonb("options").notNull(),
  correct_answer: varchar("correct_answer").notNull(),
  marks: integer("marks").notNull().default(1),
  created_at: timestamp("created_at").defaultNow(),
});

// Exam Submissions - MATCHING YOUR DATABASE
export const examSubmissions = pgTable("exam_submissions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  exam_id: integer("exam_id").references(() => exams.id),
  student_id: uuid("student_id").references(() => users.id),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull().default(0),
  submitted_at: timestamp("submitted_at").defaultNow(),
  graded_by: uuid("graded_by").references(() => users.id),
});

// Enrollments - MATCHING YOUR DATABASE
export const enrollments = pgTable("enrollments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  child_name: varchar("child_name").notNull(),
  parent_name: varchar("parent_name").notNull(),
  parent_email: varchar("parent_email").notNull(),
  parent_phone: varchar("parent_phone").notNull(),
  child_age: integer("child_age").notNull(),
  status: varchar("status").notNull().default('pending'),
  created_at: timestamp("created_at").defaultNow(),
});

// Messages - MATCHING YOUR DATABASE
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  announcements: many(announcements),
  gallery: many(gallery),
  exams: many(exams),
  submissions: many(examSubmissions),
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

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  created_at: true,
});
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

export const insertGallerySchema = createInsertSchema(gallery).omit({
  id: true,
  created_at: true,
});
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof gallery.$inferSelect;

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  created_at: true,
});
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  created_at: true,
});
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export const insertExamSubmissionSchema = createInsertSchema(examSubmissions).omit({
  id: true,
  submitted_at: true,
  score: true,
  graded_by: true,
});
export type InsertExamSubmission = z.infer<typeof insertExamSubmissionSchema>;
export type ExamSubmission = typeof examSubmissions.$inferSelect;

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  created_at: true,
  status: true,
});
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  created_at: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
