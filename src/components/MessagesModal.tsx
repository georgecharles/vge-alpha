import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Paperclip } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { UserProfile } from "../lib/auth";
import { User } from "@supabase/supabase-js";

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId?: string;
  dealId?: string;
  deal?: any;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
}

export function MessagesModal({
  isOpen,
  onClose,
  receiverId,
  dealId,
  deal,
  currentUser,
  userProfile
}: MessagesModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      const mockMessages = [
        {
          id: "1",
          text: dealId
            ? `Hi, I'm interested in your property deal '${deal?.title}'. Could you tell me more about the ROI calculations?`
            : "Hi, I'm interested in learning more about your services.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          sender: currentUser?.id,
          receiver: receiverId,
        },
        {
          id: "2",
          text: dealId
            ? "Hello! Thanks for your interest. The ROI is calculated based on the projected rental income minus expenses, divided by the total investment. Would you like me to break down the specific numbers for this property?"
            : "Hello! Thanks for reaching out. How can I help you today?",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          sender: receiverId,
          receiver: currentUser?.id,
        },
      ];

      setMessages(mockMessages);
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, currentUser, receiverId, dealId, deal]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setIsLoading(true);

    setTimeout(() => {
      const newMsg = {
        id: Math.random().toString(),
        text: newMessage,
        createdAt: new Date(),
        sender: currentUser?.id,
        receiver: receiverId,
      };

      setMessages([...messages, newMsg]);
      setNewMessage("");
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=Admin&background=random`}
                alt="Admin"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>Admin</span>
              <span className="text-xs text-muted-foreground">
                Customer Support
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {deal && (
          <div className="p-3 bg-muted/30 border-b flex items-center gap-3">
            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
              <img
                src={deal.image_url}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{deal.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {deal.property_type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  £{deal.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === currentUser?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === currentUser?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === currentUser?.id
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(new Date(message.createdAt), "MMM d, h:mm a")}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleFileUpload}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
