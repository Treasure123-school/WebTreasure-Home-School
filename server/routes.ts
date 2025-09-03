import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAnnouncementSchema,
  insertGallerySchema,
  insertExamSchema,
  insertQuestionSchema,
  insertExamSubmissionSchema,
  insertEnrollmentSchema,
  insertMessageSchema,
  type Exam
} from './schema';
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ HEALTH CHECK ENDPOINT - ADD THIS FIRST
  app.get('/health', async (req, res) => {
    try {
      // Test database connection
      await storage.getAnnouncements();
      res.json({ 
        status: 'OK', 
        message: 'Server and database are connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'ERROR', 
        message: 'Database connection failed',
        error: error.message 
      });
    }
  });

  // ✅ ROOT ENDPOINT - ADD THIS SECOND
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Treasure-Home School Server API', 
      version: '1.0',
      endpoints: {
        health: '/health',
        announcements: '/api/announcements',
        gallery: '/api/gallery',
        exams: '/api/exams',
        enrollments: '/api/enrollments',
        messages: '/api/messages'
      }
    });
  });

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // ✅ SIMPLIFIED: Return demo user without database call
      res.json({
        id: "default-user-id",
        email: "demo@school.com",
        full_name: "Demo User",
        role_id: 1,
        class: "JSS1",
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error in auth:", error);
      res.status(500).json({ message: "Auth service temporarily unavailable" });
    }
  });

  // Announcements routes
  app.get('/api/announcements', async (req, res) => {
    try {
      const { audience } = req.query;
      const announcements = audience 
        ? await storage.getAnnouncementsByAudience(audience as string)
        : await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      // ✅ FALLBACK: Return sample announcements if database fails
      res.json([
        {
          id: 1,
          title: "Welcome to Treasure-Home School",
          body: "Our portal is now live!",
          audience: "All",
          created_by: null,
          created_at: new Date().toISOString()
        }
      ]);
    }
  });

  app.post('/api/announcements', async (req: any, res) => {
    try {
      const userId = "default-user-id";
      const data = insertAnnouncementSchema.parse({ ...req.body, created_by: userId });
      const announcement = await storage.createAnnouncement(data);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.put('/api/announcements/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(Number(id), data);
      res.json(announcement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAnnouncement(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Gallery routes - ✅ SIMPLIFIED WITH FALLBACK
  app.get('/api/gallery', async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      console.log('Using fallback gallery data');
      // ✅ FALLBACK: Return sample gallery images if database fails
      res.json([
        {
          id: 1,
          image_url: "https://placehold.co/600x400/2563eb/white",
          caption: "School Campus",
          uploaded_by: null,
          created_at: new Date().toISOString()
        }
      ]);
    }
  });

  app.post('/api/gallery', async (req: any, res) => {
    try {
      const userId = "default-user-id";
      const data = insertGallerySchema.parse({ ...req.body, uploaded_by: userId });
      const image = await storage.createGalleryImage(data);
      res.json(image);
    } catch (error) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGalleryImage(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Exam routes - ✅ SIMPLIFIED
  app.get('/api/exams', async (req: any, res) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.get('/api/exams/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const exam = await storage.getExam(Number(id));
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  app.post('/api/exams', async (req: any, res) => {
    try {
      const userId = "default-user-id";
      const data = insertExamSchema.parse({ ...req.body, created_by: userId });
      const exam = await storage.createExam(data);
      res.json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  app.put('/api/exams/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertExamSchema.partial().parse(req.body);
      const exam = await storage.updateExam(Number(id), data);
      res.json(exam);
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Failed to update exam" });
    }
  });

  app.delete('/api/exams/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExam(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  // Questions routes
  app.get('/api/exams/:examId/questions', async (req, res) => {
    try {
      const { examId } = req.params;
      const questions = await storage.getQuestionsByExam(Number(examId));
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/exams/:examId/questions', async (req, res) => {
    try {
      const { examId } = req.params;
      const data = insertQuestionSchema.parse({ ...req.body, exam_id: Number(examId) });
      const question = await storage.createQuestion(data);
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.put('/api/questions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(Number(id), data);
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete('/api/questions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteQuestion(Number(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Exam submissions routes
  app.get('/api/submissions/student/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const submissions = await storage.getSubmissionsByStudent(studentId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/submissions/exam/:examId', async (req, res) => {
    try {
      const { examId } = req.params;
      const submissions = await storage.getSubmissionsByExam(Number(examId));
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching exam submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/submissions/:examId/:studentId', async (req, res) => {
    try {
      const { examId, studentId } = req.params;
      const submission = await storage.getSubmission(Number(examId), studentId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  app.post('/api/submissions', async (req: any, res) => {
    try {
      const userId = "default-user-id";
      const data = insertExamSubmissionSchema.parse({ ...req.body, student_id: userId });
      const submission = await storage.createSubmission(data);
      res.json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Enrollments routes
  app.get('/api/enrollments', async (req, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', async (req, res) => {
    try {
      const data = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(data);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.put('/api/enrollments/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const enrollment = await storage.updateEnrollmentStatus(Number(id), status);
      res.json(enrollment);
    } catch (error) {
      console.error("Error updating enrollment status:", error);
      res.status(500).json({ message: "Failed to update enrollment status" });
    }
  });

  // Messages routes
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // User management routes
  app.get('/api/users', async (req, res) => {
    try {
      const { role } = req.query;
      const users = role 
        ? await storage.getUsersByRole(role as string)
        : [];
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
