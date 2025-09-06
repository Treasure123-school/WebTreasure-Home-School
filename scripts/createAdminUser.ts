import { supabase } from '@/lib/supabaseClient';

async function createAdminUser() {
  try {
    // First, get the Admin role ID
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('role_name', 'Admin')
      .single();

    if (roleError) {
      console.error('Error fetching Admin role:', roleError);
      return;
    }

    console.log('Admin role ID:', role.id);

    // Create the admin user
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: 'a9dff03b-3cf9-4d26-a7f9-0fce9d703dc7', // Use the exact ID from your logs
        email: 'admin@treasure.edu',
        full_name: 'Admin User',
        role_id: role.id
      })
      .select();

    if (error) {
      console.error('Error creating admin user:', error);
    } else {
      console.log('Admin user created successfully:', data);
    }
  } catch (error) {
    console.error('Exception creating admin user:', error);
  }
}

// Run the function
createAdminUser();
