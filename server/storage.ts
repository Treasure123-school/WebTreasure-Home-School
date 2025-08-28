import {
  users,
  announcements,
  gallery,
  exams,
  questions,
  examSubmissions,
  enrollments,
  messages,
  type User,
  type UpsertUser,
  type InsertAnnouncement,
  type Announcement,
  type InsertGallery,
  type Gallery,
  type InsertExam,
  type Exam,
  type InsertQuestion,
  type Question,
  type InsertExamSubmission,
  type ExamSubmission,
  type InsertEnrollment,
  type Enrollment,
  type InsertMessage,
  type Message,
} from './schema';
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Utility functions for type conversion
function toNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}

function toBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return defaultValue;
}

function toString(value: unknown, defaultValue = ''): string {
  if (typeof value === 'string') return value;
  if (value == null) return defaultValue;
  return String(value);
}

function toArray(value: unknown, defaultValue: any[] = []): any[] {
  return Array.isArray(value) ? value : defaultValue;
}

function toObject(value: unknown, defaultValue: object = {}): object {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : defaultValue;
}

// Fix the interface to use proper types instead of 'unknown'
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsByAudience(audience: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;
  
  // Gallery
  getGalleryImages(): Promise<Gallery[]>;
  createGalleryImage(gallery: InsertGallery): Promise<Gallery>;
  deleteGalleryImage(id: string): Promise<void>;
  
  // Exams
  getExams(): Promise<Exam[]>;
  getExamsByClass(className: string): Promise<Exam[]>;
  getActiveExamsByClass(className: string): Promise<Exam[]>;
  getExam(id: string): Promise<Exam | undefined>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: string, exam: Partial<InsertExam>): Promise<Exam>;
  deleteExam(id: string): Promise<void>;
  
  // Questions
  getQuestionsByExam(examId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  
  // Exam Submissions
  getSubmissionsByStudent(studentId: string): Promise<ExamSubmission[]>;
  getSubmissionsByExam(examId: string): Promise<ExamSubmission[]>;
  getSubmission(examId: string, studentId: string): Promise<ExamSubmission | undefined>;
  createSubmission(submission: InsertExamSubmission): Promise<ExamSubmission>;
  
  // Enrollments
  getEnrollments(): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentStatus(id: string, status: string): Promise<Enrollment>;
  
  // Messages
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // User management
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncementsByAudience(audience: string): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.audience, audience))
      .orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  async updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updated] = await db
      .update(announcements)
      .set(announcement)
      .where(eq(announcements.id, id))
      .returning();
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Gallery
  async getGalleryImages(): Promise<Gallery[]> {
    return await db.select().from(gallery).orderBy(desc(gallery.createdAt));
  }

  async createGalleryImage(galleryData: InsertGallery): Promise<Gallery> {
    const [created] = await db.insert(gallery).values(galleryData).returning();
    return created;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    await db.delete(gallery).where(eq(gallery.id, id));
  }

  // Exams
  async getExams(): Promise<Exam[]> {
    return await db.select().from(exams).orderBy(desc(exams.createdAt));
  }

  async getExamsByClass(className: string): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .where(eq(exams.className, className))
      .orderBy(desc(exams.createdAt));
  }

  async getActiveExamsByClass(className: string): Promise<Exam[]> {
    return await db
      .select()
      .from(exams)
      .where(and(eq(exams.className, className), eq(exams.isActive, true)))
      .orderBy(desc(exams.createdAt));
  }

  async getExam(id: string): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam;
  }

  async createExam(examData: InsertExam): Promise<Exam> {
    // Convert data to proper types
    const processedData: InsertExam = {
      className: toString(examData.className),
      title: toString(examData.title),
      createdBy: toString(examData.createdBy),
      subject: toString(examData.subject),
      duration: toNumber(examData.duration, 30),
      isActive: toBoolean(examData.isActive, true),
    };

    const [created] = await db.insert(exams).values(processedData).returning();
    return created;
  }

  async updateExam(id: string, examData: Partial<InsertExam>): Promise<Exam> {
    // Convert data to proper types
    const processedData: Partial<InsertExam> = {
      className: examData.className !== undefined ? toString(examData.className) : undefined,
      title: examData.title !== undefined ? toString(examData.title) : undefined,
      subject: examData.subject !== undefined ? toString(examData.subject) : undefined,
      duration: examData.duration !== undefined ? toNumber(examData.duration) : undefined,
      isActive: examData.isActive !== undefined ? toBoolean(examData.isActive) : undefined,
    };

    const [updated] = await db
      .update(exams)
      .set(processedData)
      .where(eq(exams.id, id))
      .returning();
    return updated;
  }

  async deleteExam(id: string): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  // Questions
  async getQuestionsByExam(examId: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.examId, examId));
  }

  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    // Convert data to proper types
    const processedData: InsertQuestion = {
      examId: toString(questionData.examId),
      questionText: toString(questionData.questionText),
      correctAnswer: toString(questionData.correctAnswer),
      options: toArray(questionData.options, []),
      marks: toNumber(questionData.marks, 1),
    };

    const [created] = await db.insert(questions).values(processedData).returning();
    
    // Update exam total marks
    const examQuestions = await this.getQuestionsByExam(questionData.examId);
    const totalMarks = examQuestions.reduce((sum, q) => sum + q.marks, 0);
    await db.update(exams).set({ totalMarks }).where(eq(exams.id, questionData.examId));
    
    return created;
  }

  async updateQuestion(id: string, questionData: Partial<InsertQuestion>): Promise<Question> {
    // Convert data to proper types
    const processedData: Partial<InsertQuestion> = {
      questionText: questionData.questionText !== undefined ? toString(questionData.questionText) : undefined,
      correctAnswer: questionData.correctAnswer !== undefined ? toString(questionData.correctAnswer) : undefined,
      options: questionData.options !== undefined ? toArray(questionData.options) : undefined,
      marks: questionData.marks !== undefined ? toNumber(questionData.marks) : undefined,
    };

    const [updated] = await db
      .update(questions)
      .set(processedData)
      .where(eq(questions.id, id))
      .returning();
    return updated;
  }

  async deleteQuestion(id: string): Promise<void> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    if (question) {
      await db.delete(questions).where(eq(questions.id, id));
      
      // Update exam total marks
      const examQuestions = await this.getQuestionsByExam(question.examId);
      const totalMarks = examQuestions.reduce((sum, q) => sum + q.marks, 0);
      await db.update(exams).set({ totalMarks }).where(eq(exams.id, question.examId));
    }
  }

  // Exam Submissions
  async getSubmissionsByStudent(studentId: string): Promise<ExamSubmission[]> {
    return await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.studentId, studentId))
      .orderBy(desc(examSubmissions.submittedAt));
  }

  async getSubmissionsByExam(examId: string): Promise<ExamSubmission[]> {
    return await db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.examId, examId))
      .orderBy(desc(examSubmissions.submittedAt));
  }

  async getSubmission(examId: string, studentId: string): Promise<ExamSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(examSubmissions)
      .where(and(eq(examSubmissions.examId, examId), eq(examSubmissions.studentId, studentId)));
    return submission;
  }

  async createSubmission(submissionData: InsertExamSubmission): Promise<ExamSubmission> {
    // Convert data to proper types
    const processedData = {
      examId: toString(submissionData.examId),
      studentId: toString(submissionData.studentId),
      answers: toObject(submissionData.answers, {}),
    };

    // Get exam questions to calculate score
    const examQuestions = await this.getQuestionsByExam(processedData.examId);
    const answers = processedData.answers as Record<string, string>;
    
    let score = 0;
    let totalMarks = 0;
    
    for (const question of examQuestions) {
      totalMarks += question.marks;
      if (answers[question.id] === question.correctAnswer) {
        score += question.marks;
      }
    }
    
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    
    const [created] = await db
      .insert(examSubmissions)
      .values({
        ...processedData,
        score,
        totalMarks,
        percentage,
      })
      .returning();
    
    return created;
  }

  // Enrollments
  async getEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments).orderBy(desc(enrollments.createdAt));
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    // Convert data to proper types
    const processedData: InsertEnrollment = {
      childName: toString(enrollmentData.childName),
      parentName: toString(enrollmentData.parentName),
      parentEmail: toString(enrollmentData.parentEmail),
      parentPhone: toString(enrollmentData.parentPhone),
      childAge: toNumber(enrollmentData.childAge),
    };

    const [created] = await db.insert(enrollments).values(processedData).returning();
    return created;
  }

  async updateEnrollmentStatus(id: string, status: string): Promise<Enrollment> {
    const [updated] = await db
      .update(enrollments)
      .set({ status })
      .where(eq(enrollments.id, id))
      .returning();
    return updated;
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(messageData).returning();
    return created;
  }

  // User management
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    // Validate role
    const validRoles = ['admin', 'teacher', 'student', 'parent'] as const;
    if (!validRoles.includes(role as any)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const [updated] = await db
      .update(users)
      .set({ 
        role: role as 'admin' | 'teacher' | 'student' | 'parent',
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
