import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  Users,
  HeadphonesIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getChatResponse, popularQuestions } from "../lib/chat";
import { useAuth } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "../lib/supabase";

interface Message {
  text: string;
  isUser: boolean;
  sender?: {
    full_name: string;
    email: string;
  };
  timestamp?: string;
}

interface Contact {
  id: string;
  full_name: string;
  email: string;
  last_message?: string;
  unread_count?: number;
}

const formatMessage = (text: string) => {
  // Replace **bold** with styled spans
  let formattedText = text.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="font-bold">$1</span>'
  );
  
  // Replace *italic* with styled spans
  formattedText = formattedText.replace(
    /\*(.*?)\*/g,
    '<span class="italic">$1</span>'
  );
  
  // Replace bullet points
  formattedText = formattedText.replace(
    /^- (.+)$/gm,
    '<span class="block ml-2">• $1</span>'
  );
  
  // Replace numbered lists
  formattedText = formattedText.replace(
    /^\d+\. (.+)$/gm,
    '<span class="block ml-2">$&</span>'
  );

  // Split by newlines and wrap in spans
  return formattedText.split('\n').map((line, i) => (
    line ? `<span class="block">${line}</span>` : '<span class="block h-2"></span>'
  )).join('');
};

export function ChatBot() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("ai");
  const [aiMessages, setAiMessages] = React.useState<Message[]>([]);
  const [supportMessages, setSupportMessages] = React.useState<Message[]>([]);
  const [directMessages, setDirectMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(
    null,
  );
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Load contacts for direct messaging
  React.useEffect(() => {
    if (user) {
      loadContacts();

      // Listen for open-messages event
      const handleOpenMessages = (e: CustomEvent) => {
        setIsOpen(true);
        setActiveTab("messages");
        const receiverId = e.detail.receiverId;
        const contact = contacts.find((c) => c.id === receiverId);
        if (contact) {
          setSelectedContact(contact);
        }
      };

      window.addEventListener(
        "open-messages",
        handleOpenMessages as EventListener,
      );
      return () =>
        window.removeEventListener(
          "open-messages",
          handleOpenMessages as EventListener,
        );
    }
  }, [user, contacts]);

  const loadContacts = async () => {
    try {
      const { data: messages } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, email),
          receiver:profiles!messages_receiver_id_fkey(id, full_name, email)
        `,
        )
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (!messages) return;

      // Create unique contacts list
      const uniqueContacts = new Map<string, Contact>();
      messages.forEach((msg) => {
        const contact = msg.sender.id === user?.id ? msg.receiver : msg.sender;
        if (!uniqueContacts.has(contact.id)) {
          uniqueContacts.set(contact.id, {
            id: contact.id,
            full_name: contact.full_name,
            email: contact.email,
            last_message: msg.content,
            unread_count: msg.receiver_id === user?.id && !msg.is_read ? 1 : 0,
          });
        }
      });

      setContacts(Array.from(uniqueContacts.values()));
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    if (activeTab === "ai") {
      // AI Assistant
      setAiMessages((prev) => [...prev, { text, isUser: true }]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await getChatResponse(text);
        setAiMessages((prev) => [...prev, { text: response, isUser: false }]);

        // Store AI response in Supabase (sender_id will be null for AI)
        const { error: aiError } = await supabase.from("messages").insert([
          {
            sender_id: user?.id,
            receiver_id: user?.id, // or a specific support user ID
            content: text,
            is_support: false,
          },
          {
            sender_id: null, // AI has no sender ID
            receiver_id: user?.id,
            content: response,
            is_support: false,
          },
        ]);

        if (aiError) {
          console.error("Supabase insert error (AI):", aiError);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === "support") {
      // Handle support messages
      setSupportMessages((prev) => [...prev, { text, isUser: true }]);
      setInput("");

      if (user) {
        try {
          // Store support message in Supabase
          const { error } = await supabase.from("messages").insert([
            {
              sender_id: user.id,
              receiver_id: "support", // You might want to use a specific support user ID
              content: text,
              is_support: true,
            },
          ]);

          if (error) {
            console.error("Error sending support message:", error);
          }
        } catch (error) {
          console.error("Error sending support message:", error);
        }
      }

      // You might want to add an automatic response or connect to a support system
      setTimeout(() => {
        setSupportMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your message. Our support team will get back to you soon.",
            isUser: false,
          },
        ]);
      }, 1000);
    } else {
      // Direct Message or Support
      if (!user || !selectedContact) return;

      try {
        console.log("Sending message to Supabase:", { // Add this line
          sender_id: user.id,
          receiver_id: selectedContact.id,
          content: text,
          is_support: activeTab === "support",
        });
        const { data, error } = await supabase.from("messages").insert([
          {
            sender_id: user.id,
            receiver_id: selectedContact.id,
            content: text,
            is_support: activeTab === "support",
          },
        ]);

        if (error) {
          console.error("Supabase insert error:", error); // Add this line
          throw error;
        }

        console.log("Supabase insert success:", data); // Add this line

        setDirectMessages((prev) => [
          ...prev,
          {
            text,
            isUser: true,
            sender: {
              full_name: profile?.full_name || "",
              email: profile?.email || "",
            },
            timestamp: new Date().toISOString(),
          },
        ]);
        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [aiMessages, supportMessages, directMessages]);

  React.useEffect(() => {
    scrollToBottom();
  }, [isLoading]);

  // Subscribe to new messages
  React.useEffect(() => {
    if (!user || !selectedContact) return;

    const subscription = supabase
      .channel(`messages:${user.id}:${selectedContact.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${user.id}))`,
        },
        (payload) => {
          console.log("Realtime message received:", payload); // Add this line
          const newMessage = payload.new;
          if (newMessage.sender_id !== user.id) {
            setDirectMessages((prev) => [
              ...prev,
              {
                text: newMessage.content,
                isUser: false,
                sender: selectedContact,
                timestamp: newMessage.created_at,
              },
            ]);
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, selectedContact]);

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-full sm:w-[380px] md:w-[420px] max-w-[95vw] z-50"
          >
            <Card className="overflow-hidden shadow-xl border-primary/20 bg-white">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <div className="p-4 border-b flex items-center justify-between bg-primary/5">
                  <TabsList>
                    <TabsTrigger value="ai" className="flex items-center gap-2">
                      <Bot className="w-4 h-4" /> AI Assistant
                    </TabsTrigger>
                    <TabsTrigger
                      value="messages"
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" /> Messages
                    </TabsTrigger>
                    <TabsTrigger
                      value="support"
                      className="flex items-center gap-2"
                    >
                      <HeadphonesIcon className="w-4 h-4" /> Support
                    </TabsTrigger>
                  </TabsList>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <TabsContent value="ai" className="m-0 bg-white">
                  <div
                    ref={scrollRef}
                    className="h-96 p-4 space-y-4 overflow-y-auto"
                  >
                    {aiMessages.length === 0 ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Hello! I'm your property assistant. Ask me anything
                          about property investment, or try one of these popular
                          questions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {popularQuestions.map((question, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleSend(question)}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      aiMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.isUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p 
                              className="text-sm whitespace-pre-wrap"
                              dangerouslySetInnerHTML={{
                                __html: message.isUser ? message.text : formatMessage(message.text)
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                          <p className="text-sm">Typing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about property..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSend(input);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleSend(input)}
                        disabled={!input.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="messages" className="m-0 bg-white">
                  <div
                    ref={scrollRef}
                    className="h-96 p-4 space-y-4 overflow-y-auto"
                  >
                    {!user ? (
                      <div className="text-center p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Please sign in to view messages
                        </p>
                      </div>
                    ) : !selectedContact ? (
                      <div className="space-y-4">
                        {contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                            onClick={() => setSelectedContact(contact)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.full_name)}&background=random`}
                                  alt={contact.full_name}
                                />
                                <AvatarFallback>
                                  {contact.full_name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {contact.full_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {contact.last_message}
                                </p>
                              </div>
                            </div>
                            {contact.unread_count && contact.unread_count > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                {contact.unread_count}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {directMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                            >
                              <p className="text-sm">{message.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedContact && (
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSend(input);
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleSend(input)}
                          disabled={!input.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="support" className="m-0 bg-white">
                  <div
                    ref={scrollRef}
                    className="h-96 p-4 space-y-4 overflow-y-auto"
                  >
                    {supportMessages.length === 0 ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Welcome to support! How can we help you today?
                        </p>
                      </div>
                    ) : (
                      supportMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your support question..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSend(input);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleSend(input)}
                        disabled={!input.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
