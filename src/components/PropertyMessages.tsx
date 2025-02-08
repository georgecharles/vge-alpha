import React from "react";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { sendMessage, getConversation } from "../lib/messages";
import { supabase } from "../lib/supabase";
import { useToast } from "./ui/use-toast";

interface PropertyMessagesProps {
  receiverId: string;
}

export function PropertyMessages({ receiverId }: PropertyMessagesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (user) {
      loadMessages();
      // Subscribe to realtime updates
      const subscription = supabase
        .channel(`messages:${user.id}:${receiverId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id}))`,
          },
          () => {
            loadMessages();
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, receiverId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      const data = await getConversation(user.id, receiverId);
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await sendMessage(user.id, receiverId, newMessage);
      setNewMessage("");
      loadMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isSender = message.sender_id === user?.id;
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isSender ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${isSender ? message.sender.email : message.receiver.email}`}
                  alt={
                    isSender
                      ? message.sender.full_name
                      : message.receiver.full_name
                  }
                />
                <AvatarFallback className="bg-primary/10">
                  {(isSender
                    ? message.sender.full_name
                    : message.receiver.full_name
                  )
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${isSender ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px]"
          />
          <Button type="submit" disabled={isSubmitting || !newMessage.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
