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
import { eq, desc, and } from "drizzle-orm";

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
    return await db.select().from(announcements).where(eq(announcements.audience, audience)).orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const dbAnnouncement = {
      title: announcement.title,
      body: announcement.body,
      audience: announcement.audience,
      created_by: announcement.createdBy,
    };
    const [created] = await db.insert(announcements).values(dbAnnouncement).returning();
    return created;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const dbAnnouncement = {
      title: announcement.title,
      body: announcement.body,
      audience: announcement.audience,
      created_by: announcement.createdBy,
    };
    const [updated] = await db.update(announcements).set(dbAnnouncement).where(eq(announcements.id, id)).returning();
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
    const dbGalleryData = {
      image_url: galleryData.imageUrl,
      caption: galleryData.caption,
      uploaded_by: galleryData.uploadedBy,
    };
    const [created] = await db.insert(gallery).values(dbGalleryData).returning();
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
    const dbExamData = {
      title: examData.title,
      subject: examData.subject,
      class: examData.class,
      created_by: examData.createdBy,
    };
    const [created] = await db.insert(exams).values(dbExamData).returning();
    return created;
  }

  async updateExam(id: number, examData: Partial<InsertExam>): Promise<Exam> {
    const dbExamData = {
      title: examData.title,
      subject: examData.subject,
      class: examData.class,
      created_by: examData.createdBy,
    };
    const [updated] = await db.update(exams).set(dbExamData).where(eq(exams.id, id)).returning();
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
    const dbQuestionData = {
      exam_id: questionData.examId,
      question_text: questionData.questionText,
      options: questionData.options,
      correct_answer: questionData.correctAnswer,
      marks: questionData.marks,
    };
    const [created] = await db.insert(questions).values(dbQuestionData).returning();
    return created;
  }

  async updateQuestion(id: number, questionData: Partial<InsertQuestion>): Promise<Question> {
    const dbQuestionData = {
      exam_id: questionData.examId,
      question_text: questionData.questionText,
      options: questionData.options,
      correct_answer: questionData.correctAnswer,
      marks: questionData.marks,
    };
    const [updated] = await db.update(questions).set(dbQuestionData).where(eq(questions.id, id)).returning();
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
    const dbSubmissionData = {
      exam_id: submissionData.examId,
      student_id: submissionData.studentId,
      answers: submissionData.answers,
      score: submissionData.score,
      graded_by: submissionData.gradedBy,
    };
    const [created] = await db.insert(examSubmissions).values(dbSubmissionData).returning();
    return created;
  }

  // Enrollments
  async getEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments).orderBy(desc(enrollments.createdAt));
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const dbEnrollmentData = {
      child_name: enrollmentData.childName,
      parent_name: enrollmentData.parentName,
      parent_email: enrollmentData.parentEmail,
      parent_phone: enrollmentData.parentPhone,
      child_age: enrollmentData.childAge,
      status: enrollmentData.status,
    };
    const [created] = await db.insert(enrollments).values(dbEnrollmentData).returning();
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
    const dbMessageData = {
      name: messageData.name,
      email: messageData.email,
      message: messageData.message,
    };
    const [created] = await db.insert(messages).values(dbMessageData).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
