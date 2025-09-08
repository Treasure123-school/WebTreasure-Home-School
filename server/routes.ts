// Add these imports at the top with other imports
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Initialize Supabase admin client (add after your other supabase initializations)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ===== ADMIN USER MANAGEMENT ROUTES =====
app.post('/api/admin/users', authenticateToken, async (req: any, res) => {
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
      // Continue even if email fails
    }

    res.status(201).json({
      ...userData,
      role_name: userData.roles?.role_name
    });

  } catch (error: any) {
    console.error("Admin user creation error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.get('/api/admin/users', authenticateToken, async (req: any, res) => {
  try {
    const { search, role, class: userClass, page = 1, limit = 10 } = req.query;
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
      query = query.eq('roles.role_name', role.charAt(0).toUpperCase() + role.slice(1));
    }

    if (userClass && userClass !== 'all') {
      query = query.eq('class', userClass);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Failed to fetch users" });
    }

    res.json({
      users: data.map(user => ({
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

app.put('/api/admin/users/:id', authenticateToken, async (req: any, res) => {
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

app.put('/api/admin/users/:id/role', authenticateToken, async (req: any, res) => {
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

app.delete('/api/admin/users/:id', authenticateToken, async (req: any, res) => {
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

app.post('/api/admin/users/:id/send-welcome', authenticateToken, async (req: any, res) => {
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
      await sendWelcomeEmail(user.email, tempPassword, user.full_name, user.roles?.role_name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    res.json({ message: "Welcome email sent successfully" });

  } catch (error: any) {
    console.error("Send welcome email error:", error);
    res.status(500).json({ message: "Failed to send welcome email" });
  }
});

// Email helper function
async function sendWelcomeEmail(email: string, password: string, fullName: string, role: string) {
  // Implement with your email service (SendGrid, Mailgun, etc.)
  console.log(`Sending welcome email to ${email}`);
  console.log(`Temporary password: ${password}`);
  
  // Example implementation:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: 'noreply@treasurehomeschool.com',
    subject: 'Welcome to Treasure-Home School Portal',
    html: `<h2>Welcome ${fullName}!</h2><p>Your account has been created as ${role}.</p>`
  };
  
  await sgMail.send(msg);
  */
}
