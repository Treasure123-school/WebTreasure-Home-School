import type { Express, Request, Response, NextFunction } from "express";
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Initialize Supabase clients
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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

    // Check if the user is an admin before allowing access to admin routes
    const userProfile = await getUserById(user.id);
    if (!userProfile || userProfile.role_id !== 1) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Authentication failed" });
  }
};

// Helper function to get user by ID
async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
}

// Email helper function
async function sendWelcomeEmail(email: string, password: string, fullName: string, role: string) {
  console.log(`Would send welcome email to: ${email}`);
  console.log(`Credentials: ${email} / ${password}`);
  console.log(`Welcome ${fullName} as ${role}`);
}

export function registerRoutes(app: Express): void {
  // ===== AUTHENTICATION ROUTES =====
  app.post('/api/auth/login', async (req: Request, res: Response) => {
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

      const userProfile = await getUserById(data.user.id);
      
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

  // ===== ADMIN USER MANAGEMENT ROUTES =====
  app.post('/api/admin/users', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { email, password, full_name, role, class: userClass, phone, gender, dob } = req.body;

      // Validation
      if (!email || !password || !full_name || !role) {
        return res.status(400).json({ message: "Email, password, full name, and role are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Get role_id for the selected role
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('role_name', role.charAt(0).toUpperCase() + role.slice(1))
        .single();

      if (!roleData) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      // Create user in Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role_id: roleData.id
        }
      });

      if (authError) {
        console.error("Auth user creation error:", authError);
        return res.status(400).json({ message: authError.message });
      }

      // Create user in database
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
          dob: dob || null
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
        // Clean up auth user if database insertion fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.error("Database user creation error:", userError);
        return res.status(400).json({ message: userError.message });
      }

      // Send welcome email
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

  app.get('/api/admin/users', authenticateToken, async (req: Request, res: Response) => {
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

      // Apply filters
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

  app.put('/api/admin/users/:id', authenticateToken, async (req: Request, res: Response) => {
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

  app.put('/api/admin/users/:id/role', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }

      // Get role_id for the new role
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

  app.delete('/api/admin/users/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Delete user from database
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error("Error deleting user from database:", dbError);
        return res.status(400).json({ message: dbError.message });
      }

      // Delete user from auth
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

  app.post('/api/admin/users/:id/send-welcome', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Get user details
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, full_name, roles(role_name)')
        .eq('id', id)
        .single();

      if (userError || !user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a temporary password
      const tempPassword = randomBytes(12).toString('hex');
      
      // Update user password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        { password: tempPassword }
      );

      if (updateError) {
        console.error("Error updating user password:", updateError);
        return res.status(400).json({ message: updateError.message });
      }

      // Send welcome email
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

  // ===== BASIC CRUD ROUTES =====
  app.get('/api/announcements', async (req: Request, res: Response) => {
    try {
      const { audience } = req.query;
      let query = supabase.from('announcements').select('*');
      
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

  app.get('/api/gallery', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
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

  app.get('/api/exams', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
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

  app.get('/api/enrollments', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
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

  // Add more basic CRUD routes as needed...
}
