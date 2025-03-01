import { supabase } from './supabase';

export async function updateUserProfile(
  userId: string,
  updates: {
    role?: 'user' | 'moderator' | 'admin';
    subscription_tier?: 'free' | 'basic' | 'pro' | 'premium';
    subscription_status?: 'active' | 'inactive' | 'cancelled';
  }
) {
  try {
    console.log('Starting profile update for user:', userId);
    console.log('Updates to apply:', updates);

    // Check if current user is admin
    const { data: adminProfiles, error: adminCheckError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    if (adminCheckError) {
      console.error('Admin check error:', adminCheckError);
      throw adminCheckError;
    }

    if (!adminProfiles?.length || adminProfiles[0].role !== 'admin') {
      throw new Error('Unauthorized: Only admins can update user profiles');
    }

    // First verify the user exists
    const { data: existingUsers, error: existingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (existingError) {
      console.error('User verification error:', existingError);
      throw existingError;
    }

    if (!existingUsers?.length) {
      throw new Error('User not found');
    }

    console.log('Existing user:', existingUsers[0]);

    // Prepare update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    console.log('Applying updates:', updateData);

    // Update profile
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('Profile update error:', updateError);
      throw updateError;
    }

    if (!data?.length) {
      console.error('No data returned from update');
      throw new Error('Update failed - no data returned');
    }

    console.log('Profile updated successfully:', data[0]);

    // Only update role in auth metadata if role is being changed
    if (updates.role) {
      try {
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            role: updates.role
          }
        });
        console.log('Auth metadata updated for role change');
      } catch (error) {
        console.warn('Failed to update auth metadata (non-critical):', error);
      }
    }

    return data[0];
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    // Get all profiles with their subscription data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        subscription_tier,
        subscription_status,
        role
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError);
      throw profilesError;
    }

    if (!profiles) return [];

    return profiles.map(profile => ({
      ...profile,
      role: profile.role || 'user',
      subscription_tier: profile.subscription_tier || 'free',
      subscription_status: profile.subscription_status || 'active'
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
} 