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
  roleName: varchar("role_name").notNull().unique(),
});

// User storage table - MATCHING YOUR DATABASE
// REMOVED the circular reference to authUsers - this is the main fix!
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Removed reference to authUsers
  roleId: integer("role_id").references(() => roles.id).notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  gender: text("gender", { enum: ["Male", "Female"] }),
  dob: date("dob"),
  class: text("class"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements - MATCHING YOUR DATABASE
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audience: text("audience", { enum: ["All", "Admin", "Teacher", "Student", "Parent"] }).default("All"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gallery - MATCHING YOUR DATABASE
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exams - MATCHING YOUR DATABASE
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  class: text("class").notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions - MATCHING YOUR DATABASE
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  marks: integer("marks").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exam Submissions - MATCHING YOUR DATABASE
export const examSubmissions = pgTable("exam_submissions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull().default(0),
  submittedAt: timestamp("submitted_at").defaultNow(),
  gradedBy: uuid("graded_by").references(() => users.id, { onDelete: "set null" }),
});

// Enrollments - MATCHING YOUR DATABASE
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  childName: text("child_name").notNull(),
  parentName: text("parent_name").notNull(),
  parentEmail: text("parent_email").notNull(),
  parentPhone: text("parent_phone").notNull(),
  childAge: integer("child_age").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages - MATCHING YOUR DATABASE
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional tables from your database schema
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: text("status", { enum: ["present", "absent", "late"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "paid", "overdue"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: date("event_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const libraryResources = pgTable("library_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  announcements: many(announcements),
  gallery: many(gallery),
  exams: many(exams),
  submissions: many(examSubmissions),
  attendance: many(attendance),
  fees: many(fees),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

export const galleryRelations = relations(gallery, ({ one }) => ({
  uploader: one(users, {
    fields: [gallery.uploadedBy],
    references: [users.id],
  }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  creator: one(users, {
    fields: [exams.createdBy],
    references: [users.id],
  }),
  questions: many(questions),
  submissions: many(examSubmissions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  exam: one(exams, {
    fields: [questions.examId],
    references: [exams.id],
  }),
}));

export const examSubmissionsRelations = relations(examSubmissions, ({ one }) => ({
  exam: one(exams, {
    fields: [examSubmissions.examId],
  references: [exams.id],
  }),
  student: one(users, {
    fields: [examSubmissions.studentId],
    references: [users.id],
  }),
  grader: one(users, {
    fields: [examSubmissions.gradedBy],
    references: [users.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(users, {
    fields: [attendance.studentId],
    references: [users.id],
  }),
}));

export const feesRelations = relations(fees, ({ one }) => ({
  student: one(users, {
    fields: [fees.studentId],
    references: [users.id],
  }),
}));

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

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export const insertFeeSchema = createInsertSchema(fees).omit({
  id: true,
  createdAt: true,
});
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type Fee = typeof fees.$inferSelect;

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const insertLibraryResourceSchema = createInsertSchema(libraryResources).omit({
  id: true,
  createdAt: true,
});
export type InsertLibraryResource = z.infer<typeof insertLibraryResourceSchema>;
export type LibraryResource = typeof libraryResources.$inferSelect;
