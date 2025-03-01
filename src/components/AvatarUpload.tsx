import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from './ui/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUpload: (file: File) => Promise<void>;
  userInitials: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function AvatarUpload({ currentAvatarUrl, onUpload, userInitials }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG or WebP image",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(file);
      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentAvatarUrl} />
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileSelect}
      />
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Change Profile Picture'}
      </Button>
      <p className="text-sm text-muted-foreground">
        Maximum file size: 5MB. Supported formats: JPEG, PNG, WebP
      </p>
    </div>
  );
} 