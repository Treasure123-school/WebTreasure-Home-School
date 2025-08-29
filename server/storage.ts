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

// Proper conversion functions that return the exact types Drizzle expects
function convertExamData(data: InsertExam): {
  className: string;
  title: string;
  createdBy: string;
  subject: string;
  duration: number;
  isActive: boolean;
} {
  return {
    className: String(data.className),
    title: String(data.title),
    createdBy: String(data.createdBy),
    subject: String(data.subject),
    duration: typeof data.duration === 'number' ? data.duration : 
              typeof data.duration === 'string' ? parseInt(data.duration, 10) || 30 : 30,
    isActive: typeof data.isActive === 'boolean' ? data.isActive :
              data.isActive === 'true' || data.isActive === '1' ? true : false,
  };
}

function convertQuestionData(data: InsertQuestion): {
  examId: string;
  questionText: string;
  options: any[];
  correctAnswer: string;
  marks: number;
} {
  return {
    examId: String(data.examId),
    questionText: String(data.questionText),
    options: Array.isArray(data.options) ? data.options : [],
    correctAnswer: String(data.correctAnswer),
    marks: typeof data.marks === 'number' ? data.marks :
           typeof data.marks === 'string' ? parseInt(data.marks, 10) || 1 : 1,
  };
}

function convertEnrollmentData(data: InsertEnrollment): {
  childName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childAge: number;
} {
  return {
    childName: String(data.childName),
    parentName: String(data.parentName),
    parentEmail: String(data.parentEmail),
    parentPhone: String(data.parentPhone),
    childAge: typeof data.childAge === 'number' ? data.childAge :
              typeof data.childAge === 'string' ? parseInt(data.childAge, 10) || 0 : 0,
  };
}

export interface IStorage {
  // ... (keep interface the same)
}

export class DatabaseStorage implements IStorage {
  // ... (keep all other methods the same until createExam)

  async createExam(examData: InsertExam): Promise<Exam> {
    const processedData = convertExamData(examData);
    const [created] = await db.insert(exams).values(processedData).returning();
    return created;
  }

  async updateExam(id: string, examData: Partial<InsertExam>): Promise<Exam> {
    const updateData: any = {};
    
    if (examData.className !== undefined) updateData.className = String(examData.className);
    if (examData.title !== undefined) updateData.title = String(examData.title);
    if (examData.subject !== undefined) updateData.subject = String(examData.subject);
    
    if (examData.duration !== undefined) {
      updateData.duration = typeof examData.duration === 'number' ? examData.duration : 
                           typeof examData.duration === 'string' ? parseInt(examData.duration, 10) || 30 : 30;
    }
    
    if (examData.isActive !== undefined) {
      updateData.isActive = typeof examData.isActive === 'boolean' ? examData.isActive :
                           examData.isActive === 'true' || examData.isActive === '1' ? true : false;
    }

    const [updated] = await db
      .update(exams)
      .set(updateData)
      .where(eq(exams.id, id))
      .returning();
    return updated;
  }

  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    const processedData = convertQuestionData(questionData);
    const [created] = await db.insert(questions).values(processedData).returning();
    
    const examQuestions = await this.getQuestionsByExam(processedData.examId);
    const totalMarks = examQuestions.reduce((sum, q) => sum + q.marks, 0);
    await db.update(exams).set({ totalMarks }).where(eq(exams.id, processedData.examId));
    
    return created;
  }

  async updateQuestion(id: string, questionData: Partial<InsertQuestion>): Promise<Question> {
    const updateData: any = {};
    
    if (questionData.questionText !== undefined) updateData.questionText = String(questionData.questionText);
    if (questionData.correctAnswer !== undefined) updateData.correctAnswer = String(questionData.correctAnswer);
    
    if (questionData.options !== undefined) {
      updateData.options = Array.isArray(questionData.options) ? questionData.options : [];
    }
    
    if (questionData.marks !== undefined) {
      updateData.marks = typeof questionData.marks === 'number' ? questionData.marks :
                        typeof questionData.marks === 'string' ? parseInt(questionData.marks, 10) || 1 : 1;
    }

    const [updated] = await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, id))
      .returning();
    return updated;
  }

  async createSubmission(submissionData: InsertExamSubmission): Promise<ExamSubmission> {
    const processedData = {
      examId: String(submissionData.examId),
      studentId: String(submissionData.studentId),
      answers: submissionData.answers && typeof submissionData.answers === 'object' ? submissionData.answers : {},
    };

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

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const processedData = convertEnrollmentData(enrollmentData);
    const [created] = await db.insert(enrollments).values(processedData).returning();
    return created;
  }

  // ... (keep all other methods the same)
}

export const storage = new DatabaseStorage();
