// server/routes.ts
// --- FULLY UPDATED AND CORRECTED FILE ---

import type { Express, Request, Response, NextFunction } from "express";
import { createClient, User } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// --- Type Augmentation for Express Request ---
// ✅ FIX: Explicitly ensure the 'id' property exists on the User type
// This resolves build errors in environments where the base type is ambiguous.
declare global {
  namespace Express {
    interface Request {
      user?: User & { id: string };
    }
  }
}

// --- Supabase Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase URL or Service Role Key is not defined in environment variables.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// --- Middleware ---

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Access token is required." });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({ message: "Internal server error during authentication." });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('roles(role_name)')
      .eq('id', req.user.id) // This line will now compile correctly
      .single();

    if (error || !data || (data.roles as any)?.role_name !== 'Admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required." });
    }
    
    next();
  } catch (error) {
    console.error("Admin check middleware error:", error);
    return res.status(500).json({ message: "Internal server error during authorization." });
  }
};

// --- Email Helper Function (Mock) ---
async function sendWelcomeEmail(email: string, password: string, fullName: string, role: string) {
  console.log(`
    ======================================
    ✉️  MOCK WELCOME EMAIL
    --------------------------------------
    To: ${email}
    Welcome, ${fullName}!
    
    You have been registered as a ${role}.
    Your temporary password is: ${password}
    
    Please log in to the portal to continue.
    ======================================
  `);
}

// --- Route Registration ---
export function registerRoutes(app: Express): void {
  // ( ... The rest of the file remains exactly the same as the previous version ... )

  // A simple health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ===== ADMIN DASHBOARD STATS ROUTE =====
  app.get('/api/admin/dashboard-stats', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const [
        { count: userCount, error: userError },
        { count: announcementCount, error: announcementError },
        { count: examCount, error: examError },
        { data: pendingEnrollments, error: enrollmentError }
      ] = await Promise.all([
        supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('announcements').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('exams').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('enrollments').select('id').eq('status', 'pending')
      ]);

      if (userError || announcementError || examError || enrollmentError) {
        console.error({ userError, announcementError, examError, enrollmentError });
        throw new Error("Failed to fetch one or more dashboard resources.");
      }

      res.json({
        userCount: userCount ?? 0,
        announcementCount: announcementCount ?? 0,
        examCount: examCount ?? 0,
        pendingEnrollmentCount: pendingEnrollments?.length ?? 0,
      });

    } catch (error: any) {
      console.error("Dashboard stats fetch error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch dashboard data" });
    }
  });


  // ===== ADMIN USER MANAGEMENT ROUTES =====
  app.post('/api/admin/users', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    let newAuthUserId: string | null = null;
    try {
        const { email, password, full_name, role, class: userClass, phone, gender, dob } = req.body;
      
        if (!email || !password || !full_name || !role) {
            return res.status(400).json({ message: "Email, password, full name, and role are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const { data: roleData, error: roleError } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('role_name', role)
            .single();

        if (roleError || !roleData) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError) {
          if (authError.message.includes('already exists')) {
             return res.status(409).json({ message: 'User with this email already exists in authentication.' });
          }
          throw authError;
        }
        
        newAuthUserId = authData.user.id;

        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: newAuthUserId,
                email,
                full_name,
                role_id: roleData.id,
                class: userClass || null,
                phone: phone || null,
                gender: gender || null,
                dob: dob || null,
            })
            .select('*, roles(role_name)')
            .single();

        if (userError) {
            throw userError;
        }

        await sendWelcomeEmail(email, password, full_name, (userData.roles as any).role_name);

        res.status(201).json(userData);

    } catch (error: any) {
        console.error("Admin user creation error:", error);
        if (newAuthUserId) {
            await supabaseAdmin.auth.admin.deleteUser(newAuthUserId);
            console.log(`Cleaned up orphaned auth user: ${newAuthUserId}`);
        }
        res.status(500).json({ message: error.message || "Failed to create user" });
    }
  });

  app.get('/api/admin/users', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { search, role, class: userClass, page = '1', limit = '10' } = req.query;
      
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;
      
        let query = supabaseAdmin
            .from('users')
            .select('*, roles(role_name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limitNum - 1);
      
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
      
        if (role && role !== 'all') {
            const { data: roleData } = await supabaseAdmin.from('roles').select('id').eq('role_name', role).single();
            if (roleData) {
                query = query.eq('role_id', roleData.id);
            }
        }
      
        if (userClass && userClass !== 'all') {
            query = query.eq('class', userClass as string);
        }
      
        const { data, error, count } = await query;
      
        if (error) {
            throw error;
        }
      
        res.json({
            users: data,
            total: count,
            page: pageNum,
            totalPages: Math.ceil((count || 0) / limitNum)
        });
      
    } catch (error: any) {
        console.error("Admin users fetch error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
      
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) {
          if (authError.message.toLowerCase() !== 'user not found') {
            throw authError;
          }
        }

        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (dbError) {
          console.error("Error deleting user from database (auth user was already deleted):", dbError);
        }
      
        res.status(200).json({ message: "User deleted successfully" });
      
    } catch (error: any) {
        console.error("Admin user deletion error:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // ===== ANNOUNCEMENTS ROUTES =====
  app.get('/api/announcements', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin.from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { title, body, audience } = req.body;
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert({ title, body, audience, created_by: req.user!.id }) // This line will now compile correctly
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create announcement" });
    }
  });

  // ===== EXAMS ROUTES =====
  app.get('/api/exams', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('exams')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.post('/api/exams', authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const { title, subject, class: examClass } = req.body;
      
      const { data, error } = await supabaseAdmin
        .from('exams')
        .insert({ title, subject, class: examClass, created_by: req.user!.id }) // This line will now compile correctly
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: error.message || "Failed to create exam" });
    }
  });
}
