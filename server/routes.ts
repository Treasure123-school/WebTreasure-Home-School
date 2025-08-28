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

// Temporary auth stubs since replitAuth.ts was deleted
const setupAuth = async (app: Express) => {
  console.log("Auth setup would go here");
};

const isAuthenticated = (req: any, res: any, next: any) => {
  console.log("Auth check would go here");
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (commented out since replitAuth is deleted)
  // await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const userId = req.user.claims.sub;
      const userId = "temp-user-id";
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const userId = req.user.claims.sub;
      const userId = "temp-user-id";
      const data = insertAnnouncementSchema.parse({ ...req.body, createdBy: userId });
      const announcement = await storage.createAnnouncement(data);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // ... (KEEP ALL OTHER ROUTES BUT REMOVE OR COMMENT OUT isAuthenticated MIDDLEWARE)

  // Exam routes - FIX THE exams VARIABLE TYPE ISSUE
  app.get('/api/exams', /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const user = await storage.getUser(req.user.claims.sub);
      const user = await storage.getUser("temp-user-id");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let exams: Exam[]; // FIXED: Added explicit type annotation
      
      if (user.role === 'student' && user.className) {
        exams = await storage.getActiveExamsByClass(user.className);
      } else if (user.role === 'teacher' || user.role === 'admin') {
        exams = await storage.getExams();
      } else {
        exams = [];
      }
      
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  // ... (KEEP ALL OTHER ROUTES BUT REMOVE isAuthenticated MIDDLEWARE)

  const httpServer = createServer(app);
  return httpServer;
}
