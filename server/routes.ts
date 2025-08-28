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
  type Exam // ADD THIS IMPORT
} from './schema';
import { z } from "zod";

// REMOVE OR COMMENT OUT THESE LINES:
// import { setupAuth, isAuthenticated } from "./replitAuth";

// ADD THESE AUTH STUBS SINCE YOU REMOVED replitAuth.ts
const setupAuth = async (app: Express) => {
  // Your auth setup logic here or remove if not needed
  console.log("Auth setup would go here");
};

const isAuthenticated = (req: any, res: any, next: any) => {
  // Your auth middleware logic here or remove if not needed
  console.log("Auth check would go here");
  next(); // Remove this if you want to actually block unauthenticated requests
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - COMMENT OUT OR REMOVE IF NOT USING AUTH
  // await setupAuth(app);

  // Auth routes - UPDATE THESE TO NOT USE AUTH IF NOT NEEDED
  app.get('/api/auth/user', /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const userId = req.user.claims.sub; // COMMENT OUT IF NOT USING AUTH
      const userId = "temp-user-id"; // TEMPORARY FIX - REMOVE LATER
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Announcements routes - REMOVE isAuthenticated IF NOT USING AUTH
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
      // const userId = req.user.claims.sub; // COMMENT OUT IF NOT USING AUTH
      const userId = "temp-user-id"; // TEMPORARY FIX - REMOVE LATER
      const data = insertAnnouncementSchema.parse({ ...req.body, createdBy: userId });
      const announcement = await storage.createAnnouncement(data);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  // ... (KEEP ALL OTHER ROUTES THE SAME BUT REMOVE isAuthenticated MIDDLEWARE)

  // Exam routes - FIX THE exams VARIABLE TYPE ISSUE
  app.get('/api/exams', /* isAuthenticated, */ async (req: any, res) => {
    try {
      // const user = await storage.getUser(req.user.claims.sub); // COMMENT OUT IF NOT USING AUTH
      const user = await storage.getUser("temp-user-id"); // TEMPORARY FIX
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // FIX THIS LINE - ADD EXPLICIT TYPE ANNOTATION
      let exams: Exam[]; // ADD THIS TYPE ANNOTATION
      
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
