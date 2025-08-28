import { z } from "zod";

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
  profileImageUrl: z.string().optional(),
  phone: z.string().optional(),
  className: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;

// Announcement schemas
export const insertAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Content is required"),
  audience: z.enum(['all', 'students', 'teachers', 'parents']).default('all'),
  createdBy: z.string().optional(),
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = InsertAnnouncement & { 
  id: string; 
  createdAt: Date;
};

// Exam schemas
export const insertExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  className: z.string().min(1, "Class name is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  isActive: z.boolean().default(true),
  createdBy: z.string().optional(),
});

export const insertQuestionSchema = z.object({
  examId: z.string(),
  questionText: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).min(2, "At least 2 options required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  marks: z.number().min(1, "Marks must be at least 1"),
});

export type InsertExam = z.infer<typeof insertExamSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Exam = InsertExam & { 
  id: string; 
  createdAt: Date;
  totalMarks?: number;
};
export type Question = InsertQuestion & { 
  id: string; 
  createdAt: Date;
};

// Gallery schemas
export const insertGallerySchema = z.object({
  imageUrl: z.string().url("Please enter a valid URL").min(1, "Image URL is required"),
  caption: z.string().optional(),
  uploadedBy: z.string().optional(),
});

export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = InsertGallery & { 
  id: string; 
  createdAt: Date;
};

// Enrollment schemas
export const insertEnrollmentSchema = z.object({
  childName: z.string().min(1, "Child name is required"),
  parentName: z.string().min(1, "Parent name is required"),
  parentEmail: z.string().email("Valid email required"),
  parentPhone: z.string().min(1, "Phone number is required"),
  childAge: z.number().min(1, "Child age is required"),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = InsertEnrollment & { 
  id: string; 
  createdAt: Date;
};

// Message schemas
export const insertMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(1, "Message is required"),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = InsertMessage & { 
  id: string; 
  createdAt: Date;
};

// Exam submission schemas
export const insertExamSubmissionSchema = z.object({
  examId: z.string(),
  studentId: z.string(),
  answers: z.record(z.string()), // questionId: selectedAnswer
  score: z.number().default(0),
  totalMarks: z.number().default(0),
  percentage: z.number().default(0),
  gradedBy: z.string().optional(),
});

export type InsertExamSubmission = z.infer<typeof insertExamSubmissionSchema>;
export type ExamSubmission = InsertExamSubmission & { 
  id: string; 
  submittedAt: Date;
};
