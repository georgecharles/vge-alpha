import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { sendMessage, getMessages, MessageWithProfiles } from '../lib/messages';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { LoadingSpinner } from './ui/loading-spinner';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId?: string;
  dealId?: string;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  isOpen,
  onClose,
  receiverId,
  dealId
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receiver, setReceiver] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && receiverId) {
      loadMessages();
    } else {
      setMessages([]);
      setNewMessage('');
    }
  }, [isOpen, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!receiverId) return;
    
    try {
      setIsLoading(true);
      const data = await getMessages(receiverId);
      setMessages(data);
      
      // Set receiver info from the first message
      if (data.length > 0) {
        const msg = data[0];
        const receiverData = msg.sender_id === user?.id ? msg.receiver : msg.sender;
        setReceiver(receiverData);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverId || !newMessage.trim()) return;

    try {
      const message = await sendMessage(receiverId, newMessage.trim(), dealId);
      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-screen-md w-full">
        <DialogHeader>
          <DialogTitle>
            {receiver ? `Messages with ${receiver.full_name}` : 'Messages'}
          </DialogTitle>
        </DialogHeader>

        <div className="h-[400px] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center">
              <LoadingSpinner />
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-4 mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No messages yet. Send a message to start the conversation.
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender_id !== user?.id && (
                      <Avatar className="mr-2 mt-1">
                        <AvatarImage src={message.sender.avatar_url} />
                        <AvatarFallback>
                          {message.sender.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      } rounded-lg p-3`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              autoFocus
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
