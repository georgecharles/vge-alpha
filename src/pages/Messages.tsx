import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { getConversations, MessageWithProfiles, subscribeToMessages } from '../lib/messages';
import { MessagesModal } from '../components/MessagesModal';
import { Card } from '../components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Alert, AlertDescription } from '../components/ui/alert';

interface Conversation {
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  lastMessage: MessageWithProfiles;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
      const subscription = subscribeToMessages((message) => {
        loadConversations();
      });

      return () => {
        subscription?.unsubscribe();
      };
    } else {
      setError("Please sign in to view your messages");
      setIsLoading(false);
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading conversations for user:', user?.id);
      const data = await getConversations();
      console.log('Loaded conversations:', data);
      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Please sign in to view your messages
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <LoadingSpinner />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          {error ? error : "No conversations yet"}
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Card
              key={conversation.user.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                conversation.unreadCount > 0 ? 'bg-primary/5' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.user.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{conversation.user.full_name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {conversation.lastMessage.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <MessagesModal
        isOpen={!!selectedConversation}
        onClose={() => setSelectedConversation(null)}
        receiverId={selectedConversation || undefined}
      />
    </div>
  );
} 