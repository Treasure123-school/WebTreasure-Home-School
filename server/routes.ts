// server/routes.ts
import type { Express, Request, Response, NextFunction } from "express";
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Initialize Supabase clients
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    (req as any).user = user;
    
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

// Helper function to get user's role
async function getUserWithRoleById(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        roles (role_name)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    return { ...data, role_name: (data as any).roles?.role_name };
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
}

// Helper function to check if the user is an admin
async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  const userProfile = await getUserWithRoleById(user.id);
  if (userProfile?.role_name !== 'Admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
}

// Email helper function (for mock purposes)
async function sendWelcomeEmail(email: string, password: string, fullName: string, role: string) {
  console.log(`Would send welcome email to: ${email}`);
  console.log(`Credentials: ${email} / ${password}`);
  console.log(`Welcome ${fullName} as ${role}`);
}

export function registerRoutes(app: Express): void {
  // ===== ADMIN DASHBOARD STATS ROUTE (NEW) =====
  app.get('/api/admin/dashboard-stats', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const [
        usersResponse,
        announcementsResponse,
        examsResponse,
        enrollmentsResponse,
        messagesResponse,
        galleryResponse
      ] = await Promise.all([
        supabaseAdmin.from('users').select('id, email, full_name, roles(role_name)'),
        supabaseAdmin.from('announcements').select('id, title'),
        supabaseAdmin.from('exams').select('id, title, isActive'),
        supabaseAdmin.from('enrollments').select('id, status, child_name, parent_name, child_age'),
        supabaseAdmin.from('messages').select('id, name, email, message'),
        supabaseAdmin.from('gallery').select('id, caption')
      ]);

      if (usersResponse.error || announcementsResponse.error || examsResponse.error || enrollmentsResponse.error || messagesResponse.error || galleryResponse.error) {
        throw new Error("Failed to fetch one or more dashboard resources.");
      }

      res.json({
        users: usersResponse.data,
        announcements: announcementsResponse.data,
        exams: examsResponse.data,
        enrollments: enrollmentsResponse.data,
        messages: messagesResponse.data,
        gallery: galleryResponse.data
      });

    } catch (error: any) {
      console.error("Dashboard stats fetch error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch dashboard data" });
    }
  });

  // ===== ADMIN USER MANAGEMENT ROUTES =====
  app.post('/api/admin/users', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { email, password, full_name, role, class: userClass, phone, gender, dob } = req.body;
      
      if (!email || !password || !full_name || !role) {
        return res.status(400).json({ message: "Email, password, full name, and role are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('role_name', role.charAt(0).toUpperCase() + role.slice(1))
        .single();

      if (!roleData) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        console.error("Auth user creation error:", authError);
        return res.status(400).json({ message: authError.message });
      }

      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          role_id: roleData.id,
          class: userClass || null,
          phone: phone || null,
          gender: gender || null,
          dob: dob || null,
          is_active: true
        })
        .select(`
          id,
          email,
          full_name,
          phone,
          class,
          created_at,
          role_id,
          gender,
          dob,
          roles (role_name)
        `)
        .single();

      if (userError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.error("Database user creation error:", userError);
        return res.status(400).json({ message: userError.message });
      }

      try {
        await sendWelcomeEmail(email, password, full_name, role);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      res.status(201).json({
        ...userData,
        role_name: (userData as any).roles?.role_name
      });

    } catch (error: any) {
      console.error("Admin user creation error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/admin/users', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { search, role, class: userClass, page = '1', limit = '10' } = req.query;
      
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;
      
        let query = supabaseAdmin
          .from('users')
          .select(`
            id,
            email,
            full_name,
            phone,
            class,
            created_at,
            role_id,
            gender,
            dob,
            roles (role_name)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limitNum - 1);
      
        if (search) {
          query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
      
        if (role && role !== 'all') {
          query = query.eq('roles.role_name', (role as string).charAt(0).toUpperCase() + (role as string).slice(1));
        }
      
        if (userClass && userClass !== 'all') {
          query = query.eq('class', userClass as string);
        }
      
        const { data, error, count } = await query;
      
        if (error) {
          console.error("Error fetching users:", error);
          return res.status(500).json({ message: "Failed to fetch users" });
        }
      
        res.json({
          users: data.map((user: any) => ({
            ...user,
            role_name: user.roles?.role_name
          })),
          total: count,
          page: pageNum,
          totalPages: Math.ceil((count || 0) / limitNum)
        });
      
      } catch (error: any) {
        console.error("Admin users fetch error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
      }
  });

  app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { full_name, class: userClass, phone, gender, dob } = req.body;
      
        const { error } = await supabaseAdmin
          .from('users')
          .update({
            full_name,
            class: userClass,
            phone,
            gender,
            dob
          })
          .eq('id', id);
      
        if (error) {
          console.error("Error updating user:", error);
          return res.status(400).json({ message: error.message });
        }
      
        res.json({ message: "User updated successfully" });
      
      } catch (error: any) {
        console.error("Admin user update error:", error);
        res.status(500).json({ message: "Failed to update user" });
      }
  });
  
  app.put('/api/admin/users/:id/role', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
      
        if (!role) {
          return res.status(400).json({ message: "Role is required" });
        }
      
        const { data: roleData } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('role_name', role.charAt(0).toUpperCase() + role.slice(1))
          .single();

      if (!roleData) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      
      const { error } = await supabaseAdmin
        .from('users')
        .update({ role_id: roleData.id })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating user role:", error);
        return res.status(400).json({ message: error.message });
      }
      
      res.json({ message: "User role updated successfully" });
      
      } catch (error: any) {
        console.error("Admin user role update error:", error);
        res.status(500).json({ message: "Failed to update user role" });
      }
  });
  
  app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
      
        const { error: dbError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', id);
      
        if (dbError) {
          console.error("Error deleting user from database:", dbError);
          return res.status(400).json({ message: dbError.message });
        }
      
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      
        if (authError) {
          console.error("Error deleting user from auth:", authError);
        }
      
        res.json({ message: "User deleted successfully" });
      
      } catch (error: any) {
        console.error("Admin user deletion error:", error);
        res.status(500).json({ message: "Failed to delete user" });
      }
  });
  
  app.post('/api/admin/users/:id/send-welcome', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
      
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('email, full_name, roles(role_name)')
          .eq('id', id)
          .single();
      
        if (userError || !user) {
          return res.status(404).json({ message: "User not found" });
        }
      
        const tempPassword = randomBytes(12).toString('hex');
        
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          id,
          { password: tempPassword }
        );
      
        if (updateError) {
          console.error("Error updating user password:", updateError);
          return res.status(400).json({ message: updateError.message });
        }
      
        try {
          await sendWelcomeEmail(user.email, tempPassword, user.full_name, (user as any).roles?.role_name);
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }
      
        res.json({ message: "Welcome email sent successfully" });
      
      } catch (error: any) {
        console.error("Send welcome email error:", error);
        res.status(500).json({ message: "Failed to send welcome email" });
      }
  });

  // ===== ANNOUNCEMENTS ROUTES =====
  app.get('/api/announcements', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { audience } = req.query;
        let query = supabaseAdmin.from('announcements').select('*');
          if (audience) {
            query = query.eq('audience', audience);
          }
            
        const { data, error } = await query.order('created_at', { ascending: false });
            
        if (error) {
            console.error("Error fetching announcements:", error);
            return res.status(500).json({ message: "Failed to fetch announcements" });
          }
            
        res.json(data);
    } catch (error: any) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { title, body, audience } = req.body;
      const createdBy = (req as any).user.id;
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert({ title, body, audience, created_by: createdBy })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: error.message || "Failed to create announcement" });
    }
  });

  app.put('/api/announcements/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, body, audience } = req.body;
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .update({ title, body, audience })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: error.message || "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.status(204).json({ message: "Announcement deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: error.message || "Failed to delete announcement" });
    }
  });

  // ===== GALLERY ROUTES =====
  app.get('/api/gallery', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) {
            console.error("Error fetching gallery:", error);
            return res.status(500).json({ message: "Failed to fetch gallery" });
          }
            
        res.json(data);
    } catch (error: any) {
        console.error("Error fetching gallery:", error);
        res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.post('/api/gallery', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { image_url, caption } = req.body;
      const uploadedBy = (req as any).user.id;
      const { data, error } = await supabaseAdmin
        .from('gallery')
        .insert({ image_url, caption, uploaded_by: uploadedBy })
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error uploading gallery image:", error);
      res.status(500).json({ message: error.message || "Failed to upload gallery image" });
    }
  });

  app.delete('/api/gallery/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.status(204).json({ message: "Image deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: error.message || "Failed to delete gallery image" });
    }
  });

  // ===== EXAMS ROUTES =====
  app.get('/api/exams', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('exams')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) {
            console.error("Error fetching exams:", error);
            return res.status(500).json({ message: "Failed to fetch exams" });
          }
            
        res.json(data);
    } catch (error: any) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.post('/api/exams', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { title, subject, className, duration, isActive } = req.body;
      const createdBy = (req as any).user.id;
      const { data, error } = await supabaseAdmin
        .from('exams')
        .insert({ title, subject, class: className, duration, isActive, created_by: createdBy })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: error.message || "Failed to create exam" });
    }
  });

  app.put('/api/exams/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const { data, error } = await supabaseAdmin
        .from('exams')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error("Error updating exam status:", error);
      res.status(500).json({ message: error.message || "Failed to update exam status" });
    }
  });

  app.delete('/api/exams/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('exams')
        .delete()
        .eq('id', id);
      if (error) throw error;
      res.status(204).json({ message: "Exam deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: error.message || "Failed to delete exam" });
    }
  });

  // ===== EXAM QUESTIONS ROUTES (NEW) =====
  app.get('/api/exams/:examId/questions', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { examId } = req.params;
      const { data, error } = await supabaseAdmin
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch questions" });
    }
  });

  app.post('/api/exams/:examId/questions', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { examId } = req.params;
      const { questionText, options, correctAnswer, marks } = req.body;
      const { data, error } = await supabaseAdmin
        .from('questions')
        .insert({
          exam_id: examId,
          question_text: questionText,
          options,
          correct_answer: correctAnswer,
          marks
        })
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: error.message || "Failed to create question" });
    }
  });

  app.delete('/api/exams/:examId/questions/:questionId', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { questionId } = req.params;
      const { error } = await supabaseAdmin
        .from('questions')
        .delete()
        .eq('id', questionId);
      if (error) throw error;
      res.status(204).json({ message: "Question deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: error.message || "Failed to delete question" });
    }
    });
    app.put('/api/announcements/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, body, audience } = req.body;
        const { data, error } = await supabaseAdmin
            .from('announcements')
            .update({ title, body, audience })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ message: error.message || "Failed to update announcement" });
    }
    });
    app.delete('/api/announcements/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(204).json({ message: "Announcement deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: error.message || "Failed to delete announcement" });
    }
    });

  // ===== ENROLLMENT ROUTES =====
  app.get('/api/enrollments', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('enrollments')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) {
            console.error("Error fetching enrollments:", error);
            return res.status(500).json({ message: "Failed to fetch enrollments" });
          }
            
        res.json(data);
    } catch (error: any) {
        console.error("Error fetching enrollments:", error);
        res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.put('/api/enrollments/:id/status', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { data, error } = await supabaseAdmin
        .from('enrollments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error("Error updating enrollment status:", error);
      res.status(500).json({ message: error.message || "Failed to update enrollment status" });
    }
  });
}
