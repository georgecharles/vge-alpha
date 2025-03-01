import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Layout } from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AvatarUpload } from './AvatarUpload';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/use-toast';

export default function AccountSettings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('File uploaded, public URL:', publicUrl);

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      // Verify the update
      const { data: updatedProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (verifyError) {
        console.error('Verification error:', verifyError);
        throw verifyError;
      }

      console.log('Profile updated with new avatar:', updatedProfile);

      // Force a page refresh to show the new avatar
      window.location.reload();

    } catch (error) {
      console.error('Error in handleAvatarUpload:', error);
      throw error;
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);

      // Update full name
      if (formData.fullName !== profile?.full_name) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: formData.fullName })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) throw passwordError;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userInitials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>

          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <AvatarUpload
                currentAvatarUrl={profile?.avatar_url}
                onUpload={handleAvatarUpload}
                userInitials={userInitials}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={e => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={e => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
