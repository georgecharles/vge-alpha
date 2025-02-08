import React from "react";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  addComment,
  getPropertyComments,
  deleteComment,
} from "../lib/comments";
import { Lock, Trash2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface PropertyCommentsProps {
  propertyId: string;
  limit?: number;
  preview?: boolean;
}

export function PropertyComments({
  propertyId,
  limit,
  preview = false,
}: PropertyCommentsProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    loadComments();
  }, [propertyId]);

  const loadComments = async () => {
    try {
      const data = await getPropertyComments(propertyId);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  // Check if user has required subscription
  const canComment = profile?.subscription_tier !== "free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !canComment) return;

    setIsSubmitting(true);
    try {
      await addComment(propertyId, user.id, newComment);
      setNewComment("");
      await loadComments();
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    try {
      await deleteComment(commentId, user.id);
      await loadComments();
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  if (!canComment) {
    return (
      <div className="text-center p-4">
        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          Subscribe to view and add comments
        </p>
        <Button size="sm" onClick={() => (window.location.href = "/pricing")}>
          Upgrade Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {(limit ? comments.slice(0, limit) : comments).map((comment) => (
          <div key={comment.id} className="flex gap-2 items-start">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.email}`}
                alt={comment.user.full_name}
              />
              <AvatarFallback className="bg-primary/10">
                {comment.user.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{comment.user.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="mt-2">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OldPropertyComments({
  propertyId,
  limit,
  preview = false,
}: PropertyCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    loadComments();
  }, [propertyId]);

  const loadComments = async () => {
    try {
      const data = await getPropertyComments(propertyId);
      setComments(data);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(propertyId, user.id, newComment);
      setNewComment("");
      loadComments();
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    try {
      await deleteComment(commentId, user.id);
      loadComments();
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {(limit ? comments.slice(0, limit) : comments).map((comment) => (
          <div key={comment.id} className="flex gap-2 items-start">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.email}`}
                alt={comment.user.full_name}
              />
              <AvatarFallback className="bg-primary/10">
                {comment.user.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{comment.user.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="mt-2">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
