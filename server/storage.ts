import {
  users,
  announcements,
  gallery,
  exams,
  questions,
  examSubmissions,
  enrollments,
  messages,
  roles,
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
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsByAudience(audience: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  getGalleryImages(): Promise<Gallery[]>;
  createGalleryImage(gallery: InsertGallery): Promise<Gallery>;
  deleteGalleryImage(id: number): Promise<void>;
  getExams(): Promise<Exam[]>;
  getExamsByClass(className: string): Promise<Exam[]>;
  getExam(id: number): Promise<Exam | undefined>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, exam: Partial<InsertExam>): Promise<Exam>;
  deleteExam(id: number): Promise<void>;
  getQuestionsByExam(examId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;
  getSubmissionsByStudent(studentId: string): Promise<ExamSubmission[]>;
  getSubmissionsByExam(examId: number): Promise<ExamSubmission[]>;
  getSubmission(examId: number, studentId: string): Promise<ExamSubmission | undefined>;
  createSubmission(submission: InsertExamSubmission): Promise<ExamSubmission>;
  getEnrollments(): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentStatus(id: number, status: string): Promise<Enrollment>;
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
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
        set: userData,
      })
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const [roleData] = await db.select().from(roles).where(eq(roles.roleName, role));
    if (!roleData) return [];
    return await db.select().from(users).where(eq(users.roleId, roleData.id));
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncementsByAudience(audience: string): Promise<Announcement[]> {
    // FIX: Use sql.raw to handle enum comparison
    return await db.select().from(announcements)
      .where(sql`${announcements.audience} = ${audience}`)
      .orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updated] = await db.update(announcements).set(announcement).where(eq(announcements.id, id)).returning();
    return updated;
  }

  async deleteAnnouncement(id: number): Promise<void> {
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

  async deleteGalleryImage(id: number): Promise<void> {
    await db.delete(gallery).where(eq(gallery.id, id));
  }

  // Exams
  async getExams(): Promise<Exam[]> {
    return await db.select().from(exams).orderBy(desc(exams.createdAt));
  }

  async getExamsByClass(className: string): Promise<Exam[]> {
    return await db.select().from(exams).where(eq(exams.class, className)).orderBy(desc(exams.createdAt));
  }

  async getExam(id: number): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam;
  }

  async createExam(examData: InsertExam): Promise<Exam> {
    const [created] = await db.insert(exams).values(examData).returning();
    return created;
  }

  async updateExam(id: number, examData: Partial<InsertExam>): Promise<Exam> {
    const [updated] = await db.update(exams).set(examData).where(eq(exams.id, id)).returning();
    return updated;
  }

  async deleteExam(id: number): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  // Questions
  async getQuestionsByExam(examId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.examId, examId));
  }

  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    const [created] = await db.insert(questions).values(questionData).returning();
    return created;
  }

  async updateQuestion(id: number, questionData: Partial<InsertQuestion>): Promise<Question> {
    const [updated] = await db.update(questions).set(questionData).where(eq(questions.id, id)).returning();
    return updated;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // Exam Submissions
  async getSubmissionsByStudent(studentId: string): Promise<ExamSubmission[]> {
    return await db.select().from(examSubmissions).where(eq(examSubmissions.studentId, studentId)).orderBy(desc(examSubmissions.submittedAt));
  }

  async getSubmissionsByExam(examId: number): Promise<ExamSubmission[]> {
    return await db.select().from(examSubmissions).where(eq(examSubmissions.examId, examId)).orderBy(desc(examSubmissions.submittedAt));
  }

  async getSubmission(examId: number, studentId: string): Promise<ExamSubmission | undefined> {
    const [submission] = await db.select().from(examSubmissions).where(and(eq(examSubmissions.examId, examId), eq(examSubmissions.studentId, studentId)));
    return submission;
  }

  async createSubmission(submissionData: InsertExamSubmission): Promise<ExamSubmission> {
    const [created] = await db.insert(examSubmissions).values(submissionData).returning();
    return created;
  }

  // Enrollments
  async getEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments).orderBy(desc(enrollments.createdAt));
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const [created] = await db.insert(enrollments).values(enrollmentData).returning();
    return created;
  }

  async updateEnrollmentStatus(id: number, status: string): Promise<Enrollment> {
    const validStatus = status as 'pending' | 'approved' | 'rejected';
    const [updated] = await db.update(enrollments).set({ status: validStatus }).where(eq(enrollments.id, id)).returning();
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
}

export const storage = new DatabaseStorage();
