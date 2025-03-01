import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent } from "./ui/tabs";
import {
  MessageCircle,
  Send,
  X,
  Users,
} from "lucide-react";
import { popularQuestions } from "../lib/chat";
import { useAuth } from "../lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

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
  return formattedText.split('\n').map((line) => (
    line ? `<span class="block">${line}</span>` : '<span class="block h-2"></span>'
  )).join('');
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
  const navigate = useNavigate();

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
      // AI chat allowed without sign in
      setAiMessages((prev) => [...prev, { text, isUser: true }]);
      setInput("");
      setIsLoading(true);

      try {
        // Get AI response without storing in database
        const aiResponse = await fetch(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: text
                }]
              }]
            }),
          }
        );

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const response = aiData.candidates[0].content.parts[0].text;

        // Only store messages if user is signed in
        if (user) {
          const conversationId = `ai_${user.id}_${Date.now()}`;
          
          await supabase.from("messages").insert([
            {
              sender_id: user.id,
              receiver_id: user.id,
              content: text,
              is_support: false,
              conversation_id: conversationId
            },
            {
              sender_id: null,
              receiver_id: user.id,
              content: response,
              is_support: true,
              conversation_id: conversationId
            }
          ]);
        }

        setAiMessages((prev) => [...prev, { text: response, isUser: false }]);
      } catch (error) {
        console.error("Error in AI chat:", error);
        setAiMessages((prev) => [
          ...prev,
          { text: "Sorry, I encountered an error. Please try again.", isUser: false }
        ]);
      } finally {
        setIsLoading(false);
      }
    } else if (!user) {
      // Require sign in for support and direct messages
      setAiMessages((prev) => [
        ...prev,
        { text: "Please sign in to use support and direct messaging features.", isUser: false }
      ]);
      return;
    } else if (activeTab === "support") {
      // Handle support messages
      setSupportMessages((prev) => [...prev, { text, isUser: true }]);
      setInput("");

      try {
        const supportConversationId = `support_${user.id}_${Date.now()}`;

        // Insert user's support message
        const { error: userMsgError } = await supabase.from("messages").insert({
          sender_id: user.id,
          receiver_id: 'support',
          content: text,
          is_support: true,
          conversation_id: supportConversationId
        });

        if (userMsgError) throw userMsgError;

        // Insert automated support response
        const autoResponse = "Thank you for your message. Our support team will get back to you soon.";
        const { error: supportError } = await supabase.from("messages").insert({
          sender_id: null,
          receiver_id: user.id,
          content: autoResponse,
          is_support: true,
          conversation_id: supportConversationId
        });

        if (supportError) throw supportError;

        setSupportMessages((prev) => [
          ...prev,
          { text: autoResponse, isUser: false }
        ]);
      } catch (error) {
        console.error("Error handling support message:", error);
        setSupportMessages((prev) => [
          ...prev,
          { text: "Sorry, there was an error sending your message. Please try again.", isUser: false }
        ]);
      }
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
      <div className={`fixed bottom-4 right-4 z-50 ${isOpen ? 'w-96' : 'w-auto'}`}>
        {isOpen ? (
          <div className="bg-background border rounded-lg shadow-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">AI Assistant</h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/messages')}
                  title="Chat with Users"
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
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
          </div>
        ) : (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full h-12 w-12 flex items-center justify-center"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>
    </>
  );
}
