import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '../lib/auth';
import { MessageWithProfiles, getMessages, sendMessage, subscribeToMessages } from '../lib/messages';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from './ui/loading-spinner';
import { Deal } from '../lib/deals';
import { Card } from './ui/card';
import { formatCurrency } from '../lib/utils';
import { useToast } from './ui/use-toast';
import { Alert, AlertDescription } from './ui/alert';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId?: string;
  dealId?: string;
  deal?: Deal;
}

export function MessagesModal({ isOpen, onClose, receiverId, dealId, deal }: MessagesModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && receiverId) {
      loadMessages();
      const subscription = subscribeToMessages((message) => {
        if (
          (message.sender_id === receiverId && message.receiver_id === user?.id) ||
          (message.sender_id === user?.id && message.receiver_id === receiverId)
        ) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [isOpen, receiverId, user?.id]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const loadMessages = async () => {
    if (!receiverId) return;
    try {
      setIsLoading(true);
      setError(null);
      const fetchedMessages = await getMessages(receiverId);
      setMessages(fetchedMessages);
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId || !newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      setError(null);
      const message = await sendMessage(receiverId, newMessage, dealId);
      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        scrollToBottom();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!receiverId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>

        {deal && (
          <Card className="p-4 mb-4 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded overflow-hidden">
                <img
                  src={deal.image_url}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <h4 className="font-semibold">{deal.title}</h4>
                <p className="text-sm text-muted-foreground">{deal.location}</p>
                <p className="text-sm font-medium mt-1">
                  {formatCurrency(deal.price)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || !newMessage.trim()}>
            {isSending ? <LoadingSpinner /> : 'Send'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
