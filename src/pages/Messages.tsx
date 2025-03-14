import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { Layout } from '../components/Layout';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  subscribeToMessages,
  searchUsers as searchUsersApi,
  Conversation,
  MessageWithProfiles,
  User
} from '../lib/messages';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { formatDistanceToNow } from 'date-fns';
import { Send, Search, Plus, ArrowLeft, MessageSquare, UserPlus, Users, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '../components/ui/dialog';
import { PageTransition } from '../components/ui/page-transition';
import { cn } from '../lib/utils';
import useSWR from 'swr';
import { supabase } from '../lib/supabase';

export default function Messages() {
  const { user: authUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileShowMessages, setMobileShowMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSWR("session", async () => {
    const { data } = await supabase.auth.getSession();
    console.log("SWR session check:", { hasSession: !!data.session, sessionUser: data.session?.user?.id });
    return data.session;
  });

  // Authentication state detection
  const isAuthenticated = !!authUser || !!session;
  
  useEffect(() => {
    console.log("Authentication state:", { 
      authUser: !!authUser, 
      authUserId: authUser?.id,
      session: !!session, 
      sessionUserId: session?.user?.id,
      isAuthenticated
    });
  }, [authUser, session, isAuthenticated]);

  // Determine if we're in mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle mobile view when conversation is selected
  useEffect(() => {
    if (isMobileView && selectedConversation) {
      setMobileShowMessages(true);
    }
  }, [selectedConversation, isMobileView]);

  // Load initial conversations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, loading conversations");
      loadConversations();
      const subscription = subscribeToMessages((message) => {
        // When a new message arrives
        if (message.sender_id === selectedConversation || 
            message.receiver_id === selectedConversation) {
          // Add it to the current messages if it belongs to the selected conversation
          setMessages(prev => [...prev, message]);
        }
        // Refresh conversations list to update last messages
        loadConversations();
      });

      return () => {
        subscription?.unsubscribe();
      };
    } else {
      console.log("User is not authenticated");
      setError("Please sign in to view your messages");
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedConversation]);

  // Listen for auth state changes from Supabase directly
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change detected:", event, !!session);
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        console.log("Auth event triggered conversation loading");
        setError(null);
        loadConversations();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all users when the new chat dialog opens
  useEffect(() => {
    if (isNewChatOpen) {
      searchUsers('');
    }
  }, [isNewChatOpen]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const activeUser = session?.user || authUser;
      
      if (!activeUser?.id) {
        console.log("No active user found for loading conversations");
        setConversations([]);
        return;
      }
      
      console.log(`Loading conversations for user: ${activeUser.id}`);
      const data = await getConversations();
      console.log("Loaded conversations:", data);
      setConversations(data);
      setError(null);
    } catch (error) {
      console.error("Error getting conversations:", error);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      setIsMessagesLoading(true);
      const msgs = await getMessages(userId);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const message = await sendMessage(selectedConversation, newMessage.trim());
      if (message) {
        // Message will be added by the subscription
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const searchUsers = async (term: string) => {
    setIsSearching(true);
    try {
      // Log that we're starting a search
      console.log(`Starting user search with term: "${term || 'all users'}"`);
      
      // Use the searchUsers function from our messages utility
      const results = await searchUsersApi(term);
      
      // Log the results for debugging
      console.log(`Search returned ${results?.length || 0} users:`, results);
      
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBackToConversations = () => {
    setMobileShowMessages(false);
  };

  const startNewConversation = (user: User) => {
    // Check if we already have a conversation with this user
    const existingConversation = conversations.find(
      (conv) => conv.user.id === user.id
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation.user.id);
    } else {
      // Create a new conversation
      const newConversation: Conversation = {
        user,
        lastMessage: null,
        unreadCount: 0,
      };
      setSelectedConversation(newConversation.user.id);
    }
    setIsNewChatOpen(false);
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <Layout>
        <PageTransition>
          <div className="container mx-auto py-8 pt-24 px-4">
            <div className="max-w-md mx-auto">
              <Alert variant="destructive" className="shadow-md">
                <AlertTitle className="font-semibold">Authentication Required</AlertTitle>
                <AlertDescription>
                  Please sign in to view and send messages
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </PageTransition>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTransition>
        <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
          <div className="container mx-auto px-4 py-6 pt-20 md:pt-24">
            <h1 className="text-2xl font-bold mb-6 text-center">Your Messages</h1>
            <div className="grid grid-cols-1 gap-6 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:gap-6 h-[calc(100vh-220px)] md:h-[calc(100vh-260px)]">
                {/* Conversations List - hidden on mobile when viewing messages */}
                <div className={cn(
                  "md:w-1/3 lg:w-1/4 flex-shrink-0",
                  (isMobileView && mobileShowMessages) ? "hidden" : "flex flex-col"
                )}>
                  <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-2 border-blue-100 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-blue-50">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <CardTitle>Messages</CardTitle>
                      </div>
                      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline" className="rounded-full h-8 w-8 border-blue-200 bg-white">
                            <Plus className="h-4 w-4 text-blue-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <UserPlus className="h-5 w-5 text-blue-500" />
                              New Conversation
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => {
                                  setSearchTerm(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    searchUsers(searchTerm);
                                  }
                                }}
                                className="flex-1"
                              />
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                disabled={isSearching} 
                                className="shrink-0"
                                onClick={() => searchUsers(searchTerm)}
                              >
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                              </Button>
                            </div>
                            <ScrollArea className="h-[300px]">
                              {isSearching && (
                                <div className="flex justify-center items-center h-[100px]">
                                  <LoadingSpinner />
                                </div>
                              )}
                              {!isSearching && searchResults.length === 0 && (
                                <div className="text-center text-muted-foreground p-4 bg-muted/30 rounded-lg">
                                  <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                                  <p>No users found</p>
                                  <p className="text-sm mt-2">
                                    {searchTerm ? `No users match "${searchTerm}"` : "There are no other users in the system"}
                                  </p>
                                  <div className="mt-4 text-sm">
                                    <p>Try the following:</p>
                                    <ul className="list-disc text-left pl-8 mt-2 space-y-1">
                                      <li>Check if other users have registered</li>
                                      <li>Make sure your internet connection is working</li>
                                      <li>Try refreshing the page</li>
                                      <li>Check your authentication status</li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                              {!isSearching && searchResults.map(user => (
                                <div
                                  key={user.id}
                                  className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                  onClick={() => {
                                    setSelectedConversation(user.id);
                                    setIsNewChatOpen(false);
                                  }}
                                >
                                  <Avatar className="h-10 w-10 border-2 border-blue-200">
                                    <AvatarImage src={user.avatar_url || undefined} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.full_name || user.email}</p>
                                    {user.full_name && user.email && (
                                      <p className="text-xs text-muted-foreground">{user.email}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                      {error && (
                        <Alert variant="destructive" className="m-3 shadow-sm">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <LoadingSpinner size="lg" />
                        </div>
                      ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10 bg-blue-50/50">
                          <MessageSquare className="h-16 w-16 mb-4 text-blue-200" />
                          <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                          <p className="text-muted-foreground mb-6 max-w-xs">
                            Start a new conversation by clicking the plus icon above
                          </p>
                          <Button 
                            onClick={() => setIsNewChatOpen(true)}
                            className="gap-2 bg-blue-500 hover:bg-blue-600"
                            size="sm"
                          >
                            <UserPlus className="h-4 w-4" />
                            New Conversation
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="h-full">
                          <div className="divide-y divide-blue-100">
                            {conversations.map((conversation) => (
                              <div
                                key={conversation.user.id}
                                className={cn(
                                  "p-3 cursor-pointer hover:bg-blue-50 transition-colors",
                                  selectedConversation === conversation.user.id ? 'bg-blue-100' : ''
                                )}
                                onClick={() => setSelectedConversation(conversation.user.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12 border-2 border-blue-200">
                                    <AvatarImage src={conversation.user.avatar_url || undefined} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      {conversation.user.full_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium truncate">{conversation.user.full_name}</p>
                                      <p className="text-xs text-muted-foreground whitespace-nowrap pl-2">
                                        {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                                          addSuffix: true,
                                        })}
                                      </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-sm text-muted-foreground truncate">
                                        {conversation.lastMessage.sender_id === authUser.id && "You: "}
                                        {conversation.lastMessage.content}
                                      </p>
                                      {conversation.unreadCount > 0 && (
                                        <div className="bg-blue-500 text-white rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center text-xs ml-2">
                                          {conversation.unreadCount}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Messages - shown on mobile only when a conversation is selected */}
                <div className={cn(
                  "md:flex-1 flex flex-col overflow-hidden",
                  (isMobileView && !mobileShowMessages) ? "hidden" : "flex flex-col"
                )}>
                  <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-2 border-blue-100 rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 border-b bg-blue-50">
                      {selectedConversation ? (
                        <>
                          {isMobileView && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="mr-1 hover:bg-blue-100" 
                              onClick={handleBackToConversations}
                            >
                              <ArrowLeft className="h-5 w-5 text-blue-500" />
                            </Button>
                          )}
                          {conversations.find(c => c.user.id === selectedConversation)?.user && (
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Avatar className="h-8 w-8 border-2 border-blue-200">
                                <AvatarImage 
                                  src={conversations.find(c => c.user.id === selectedConversation)?.user.avatar_url || undefined} 
                                />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {conversations.find(c => c.user.id === selectedConversation)?.user.full_name.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="overflow-hidden">
                                <p className="font-medium text-sm truncate">
                                  {conversations.find(c => c.user.id === selectedConversation)?.user.full_name}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="font-medium">Messages</div>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                      {selectedConversation ? (
                        <div className="h-full flex flex-col">
                          {isMessagesLoading ? (
                            <div className="flex-1 flex justify-center items-center">
                              <LoadingSpinner size="lg" />
                            </div>
                          ) : (
                            <ScrollArea className="flex-1 p-4">
                              {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4 bg-blue-50/50">
                                  <MessageSquare className="h-16 w-16 mb-4 text-blue-200" />
                                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                                  <p className="text-muted-foreground mb-6 max-w-xs">
                                    Send a message to start the conversation
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {messages.map((message, index) => {
                                    const isUser = message.sender_id === authUser.id;
                                    const showAvatar = !isUser && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
                                    
                                    return (
                                      <div
                                        key={message.id}
                                        className={cn(
                                          "flex",
                                          isUser ? "justify-end" : "justify-start"
                                        )}
                                      >
                                        {showAvatar ? (
                                          <Avatar className="mr-2 mt-1 h-8 w-8 border-2 border-blue-200">
                                            <AvatarImage src={message.sender.avatar_url} />
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                              {message.sender.full_name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                        ) : !isUser && (
                                          <div className="w-10" /> // Spacer to align messages
                                        )}
                                        <div
                                          className={cn(
                                            "max-w-[75%] rounded-2xl px-4 py-2.5 break-words shadow-sm",
                                            isUser 
                                              ? "bg-blue-500 text-white rounded-tr-none" 
                                              : "bg-blue-100 rounded-tl-none"
                                          )}
                                        >
                                          <p className="text-sm">{message.content}</p>
                                          <p className={cn(
                                            "text-xs mt-1",
                                            isUser ? "text-blue-100" : "text-blue-500"
                                          )}>
                                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div ref={messagesEndRef} />
                                </div>
                              )}
                            </ScrollArea>
                          )}

                          <form onSubmit={handleSendMessage} className="p-3 border-t bg-blue-50">
                            <div className="flex gap-2">
                              <Input
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 border-blue-200 bg-white"
                              />
                              <Button 
                                type="submit" 
                                className="shrink-0 bg-blue-500 hover:bg-blue-600" 
                                disabled={!newMessage.trim()}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send
                              </Button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4 bg-blue-50/50">
                          <MessageSquare className="h-16 w-16 mb-4 text-blue-200" />
                          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                          <p className="text-muted-foreground mb-6 max-w-xs">
                            Choose a conversation from the list or start a new one
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}

const NewConversationDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (user: User) => void;
}> = ({ open, onOpenChange, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load all users when the dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      searchUsers("")
        .then((users) => {
          console.log("Initial users loaded:", users);
          setSearchResults(users);
          setHasSearched(true);
        })
        .catch((error) => {
          console.error("Error loading initial users:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Reset state when dialog closes
      setSearchTerm("");
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [open]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const users = await searchUsers(searchTerm);
      console.log(`Search results for "${searchTerm}":`, users);
      setSearchResults(users);
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Search for users to start a conversation
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <ul className="space-y-2">
              {searchResults.map((user) => (
                <li key={user.id}>
                  <button
                    className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-muted transition-colors"
                    onClick={() => onSelectUser(user)}
                  >
                    <Avatar>
                      <AvatarImage
                        src={user.avatar_url || undefined}
                        alt={user.full_name || "User"}
                      />
                      <AvatarFallback>
                        {(user.full_name || "U").substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : hasSearched ? (
            <div className="text-center py-4 text-muted-foreground">
              No users found. {searchTerm ? "Try a different search term." : "There are no other users in the system."}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 