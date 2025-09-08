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
  insertMessageSchema
} from './schema';
import { z } from "zod";
import { sql } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for public access
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🚨 NEW: Initialize Supabase client for admin access using the service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ AUTHENTICATION MIDDLEWARE - DECLARED BEFORE USE
const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // 🚨 NEW: Check if the user is an admin before allowing access to admin routes
    const userProfile = await storage.getUserById(user.id);
    if (!userProfile || userProfile.role_id !== 1) { // 1 is the ID for the Admin role
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Authentication failed" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ DEBUG ENDPOINT
  app.get('/api/debug', async (req, res) => {
    try {
      const result = await storage.getAnnouncements();
      res.json({
        status: 'SUCCESS',
        database: 'Connected successfully!',
        data_count: result.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Database connection failed',
        error: error.message
      });
    }
  });

  // ✅ HEALTH CHECK ENDPOINT
  app.get('/health', async (req, res) => {
    try {
      await storage.getAnnouncements();
      res.json({ 
        status: 'OK', 
        message: 'Server and database are connected',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: 'ERROR', 
        message: 'Database connection failed',
        error: error.message 
      });
    }
  });

  // ✅ ROOT ENDPOINT
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Treasure-Home School Server API', 
      version: '1.0',
      endpoints: {
        auth: {
          login: 'POST /api/auth/login',
          signup: 'POST /api/auth/signup',
          me: 'GET /api/auth/me',
          logout: 'POST /api/auth/logout',
          initAdmin: 'POST /api/auth/init-admin'
        },
        debug: '/api/debug',
        health: '/health',
        announcements: '/api/announcements',
        gallery: '/api/gallery',
        exams: '/api/exams',
        enrollments: '/api/enrollments',
        messages: '/api/messages',
        users: '/api/users/:id'
      }
    });
  });

  // ===== AUTHENTICATION ROUTES =====

  // ✅ SUPABASE LOGIN
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase login error:", error);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const userProfile = await storage.getUserById(data.user.id);
      
      if (!userProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }

      res.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: userProfile.full_name,
          role_id: userProfile.role_id,
          class: userProfile.class,
          phone: userProfile.phone,
          gender: userProfile.gender,
          dob: userProfile.dob
        },
        session: data.session
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // ✅ SUPABASE SIGNUP - FIXED DATE HANDLING
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, full_name, role_id, class: userClass, phone, gender, dob } = req.body;

      if (!email || !password || !full_name || !role_id) {
        return res.status(400).json({ message: "All required fields are missing" });
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role_id
          }
        }
      });

      if (authError) {
        console.error("Supabase signup error:", authError);
        return res.status(400).json({ message: authError.message });
      }

      if (authData.user) {
        // FIX: Pass the dob string directly instead of Date object
        const userProfile = await storage.createUser({
          id: authData.user.id,
          full_name,
          email,
          role_id,
          class: userClass,
          phone,
          gender,
          dob: dob || null // Pass string directly or null
        });

        res.json({
          message: "User created successfully",
          user: userProfile,
          session: authData.session
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Signup failed" });
    }
  });

  // ✅ GET CURRENT USER
  app.get('/api/auth/me', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const userProfile = await storage.getUserById(user.id);
      
      if (!userProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        full_name: userProfile.full_name,
        role_id: userProfile.role_id,
        class: userProfile.class,
        phone: userProfile.phone,
        gender: userProfile.gender,
        dob: userProfile.dob
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // ✅ GET USER BY ID ENDPOINT - ADDED THIS
  app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ✅ LOGOUT - FIXED SIGNOUT CALL
  app.post('/api/auth/logout', async (req, res) => {
    try {
      // FIX: Remove the token parameter from signOut
      await supabase.auth.signOut();
      
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // ✅ INITIALIZE DEFAULT ADMIN - FIXED DATE HANDLING
  app.post('/api/auth/init-admin', async (req, res) => {
    try {
      const adminEmail = "admin@treasure.edu";
      const adminPassword = "admin123";
      const adminName = "System Administrator";

      const existingAdmin = await storage.getUserByEmail(adminEmail);
      if (existingAdmin) {
        return res.json({ message: "Admin user already exists" });
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: adminName,
            role_id: 1
          }
        }
      });

      if (authError) {
        console.error("Admin creation error:", authError);
        return res.status(400).json({ message: authError.message });
      }

      if (authData.user) {
        await storage.createUser({
          id: authData.user.id,
          full_name: adminName,
          email: adminEmail,
          role_id: 1,
          class: null,
          phone: null,
          gender: null,
          dob: null
        });

        res.json({ 
          message: "Default admin created successfully",
          credentials: {
            email: adminEmail,
            password: adminPassword,
            note: "Change this password after first login"
          }
        });
      }
    } catch (error: any) {
      console.error("Init admin error:", error);
      res.status(500).json({ message: "Failed to initialize admin" });
    }
  });

  // ===== PROTECTED ROUTES =====

  // Announcements routes
  app.get('/api/announcements', async (req, res) => {
    try {
      const { audience } = req.query;
      const announcements = audience 
        ? await storage.getAnnouncementsByAudience(audience as string)
        : await storage.getAnnouncements();
      res.json(announcements);
    } catch (error: any) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', authenticateToken, async (req: any, res) => {
    try {
      const data = insertAnnouncementSchema.parse({ ...req.body, created_by: req.user.id });
      const announcement = await storage.createAnnouncement(data);
      res.json(announcement);
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.put('/api/announcements/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(Number(id), data);
      res.json(announcement);
    } catch (error: any) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAnnouncement(Number(id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Gallery routes
  app.get('/api/gallery', async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error: any) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.post('/api/gallery', authenticateToken, async (req: any, res) => {
    try {
      const data = insertGallerySchema.parse({ ...req.body, uploaded_by: req.user.id });
      const image = await storage.createGalleryImage(data);
      res.json(image);
    } catch (error: any) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.delete('/api/gallery/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGalleryImage(Number(id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Exam routes
  app.get('/api/exams', async (req: any, res) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  app.post('/api/exams', authenticateToken, async (req: any, res) => {
    try {
      const data = insertExamSchema.parse({ ...req.body, created_by: req.user.id });
      const exam = await storage.createExam(data);
      res.json(exam);
    } catch (error: any) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  app.put('/api/exams/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertExamSchema.partial().parse(req.body);
      const exam = await storage.updateExam(Number(id), data);
      res.json(exam);
    } catch (error: any) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Failed to update exam" });
    }
  });

  app.delete('/api/exams/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExam(Number(id));
      res.json({ success: true });
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/exams/:examId/questions', authenticateToken, async (req, res) => {
    try {
      const { examId } = req.params;
      const data = insertQuestionSchema.parse({ ...req.body, exam_id: Number(examId) });
      const question = await storage.createQuestion(data);
      res.json(question);
    } catch (error: any) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.put('/api/questions/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(Number(id), data);
      res.json(question);
    } catch (error: any) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  app.delete('/api/questions/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteQuestion(Number(id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Exam submissions routes
  app.get('/api/submissions/student/:studentId', authenticateToken, async (req, res) => {
    try {
      const { studentId } = req.params;
      const submissions = await storage.getSubmissionsByStudent(studentId);
      res.json(submissions);
    } catch (error: any) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/submissions/exam/:examId', authenticateToken, async (req, res) => {
    try {
      const { examId } = req.params;
      const submissions = await storage.getSubmissionsByExam(Number(examId));
      res.json(submissions);
    } catch (error: any) {
      console.error("Error fetching exam submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/submissions/:examId/:studentId', authenticateToken, async (req, res) => {
    try {
      const { examId, studentId } = req.params;
      const submission = await storage.getSubmission(Number(examId), studentId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(submission);
    } catch (error: any) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  app.post('/api/submissions', authenticateToken, async (req: any, res) => {
    try {
      const data = insertExamSubmissionSchema.parse({ ...req.body, student_id: req.user.id });
      const submission = await storage.createSubmission(data);
      res.json(submission);
    } catch (error: any) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Enrollments routes
  app.get('/api/enrollments', authenticateToken, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (error: any) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', async (req, res) => {
    try {
      const data = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(data);
      res.json(enrollment);
    } catch (error: any) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.put('/api/enrollments/:id/status', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const enrollment = await storage.updateEnrollmentStatus(Number(id), status);
      res.json(enrollment);
    } catch (error: any) {
      console.error("Error updating enrollment status:", error);
      res.status(500).json({ message: "Failed to update enrollment status" });
    }
  });

  // Messages routes
  app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      res.json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // User management routes
  app.get('/api/users', authenticateToken, async (req, res) => {
    try {
      const { role } = req.query;
      const users = role 
        ? await storage.getUsersByRole(role as string)
        : [];
      res.json(users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
