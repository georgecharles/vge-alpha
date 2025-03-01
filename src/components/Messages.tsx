import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { Layout } from './Layout';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from './ui/use-toast';
import { Search, Plus, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  conversation_id: string;
  sender?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Profile {
  full_name: string;
  avatar_url: string | null;
}

interface ConversationParticipant {
  user_id: string;
  profile: Profile;
}

interface SupabaseProfile {
  full_name: string;
  avatar_url: string | null;
}

interface DatabaseParticipant {
  user_id: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface SupabaseParticipant {
  user_id: string;
  profile: SupabaseProfile;
}

interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
}

function isValidParticipant(participant: any): participant is DatabaseParticipant {
  return (
    participant &&
    typeof participant.user_id === 'string' &&
    participant.profile &&
    typeof participant.profile.full_name === 'string' &&
    (participant.profile.avatar_url === null || typeof participant.profile.avatar_url === 'string')
  );
}

const transformParticipants = (participants: any[]): ConversationParticipant[] => {
  return participants
    .filter(isValidParticipant)
    .map(p => ({
      user_id: p.user_id,
      profile: {
        full_name: p.profile.full_name,
        avatar_url: p.profile.avatar_url
      }
    }));
};

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch conversations
    const fetchConversations = async () => {
      try {
        console.log('Fetching conversations for user:', user?.id);

        // First get all conversations for the user
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user?.id);

        if (participantsError) {
          console.error('Error fetching participants:', participantsError);
          throw participantsError;
        }

        console.log('Found participant records:', participants);

        if (!participants?.length) {
          console.log('No conversations found');
          setConversations([]);
          setIsLoading(false);
          return;
        }

        const conversationIds = participants.map(p => p.conversation_id);
        console.log('Conversation IDs:', conversationIds);

        // Then get the conversation details
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            participants:conversation_participants!inner (
              user_id,
              profile:profiles!inner (
                full_name,
                avatar_url
              )
            ),
            messages (
              id,
              content,
              sender_id,
              created_at
            )
          `)
          .in('id', conversationIds)
          .order('created_at', { ascending: false });

        if (conversationsError) {
          console.error('Error fetching conversations:', conversationsError);
          throw conversationsError;
        }

        console.log('Raw conversations data:', conversations);

        const transformedData: Conversation[] = (conversations || []).map(conv => {
          // Get the last message if any exist
          const lastMessage = conv.messages && conv.messages.length > 0 
            ? conv.messages[conv.messages.length - 1] 
            : undefined;

          return {
            id: conv.id,
            participants: transformParticipants(conv.participants),
            last_message: lastMessage
          };
        });

        console.log('Transformed conversations:', transformedData);
        setConversations(transformedData);
      } catch (error) {
        console.error('Error in fetchConversations:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load conversations",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, payload => {
        const newMessage = payload.new as Message;
        if (selectedConversation?.id === newMessage.conversation_id) {
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, selectedConversation?.id]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user?.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .neq('id', user?.id)
        .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const startConversation = async (otherUser: UserProfile) => {
    try {
      // Check for existing conversation more efficiently
      const { data: existingParticipations, error: checkError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user?.id);

      if (checkError) throw checkError;

      if (existingParticipations?.length) {
        const { data: existingConvo, error: existingError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', existingParticipations.map(p => p.conversation_id))
          .eq('user_id', otherUser.id)
          .single();

        if (existingError && existingError.code !== 'PGRST116') { // Ignore "no rows returned" error
          throw existingError;
        }

        if (existingConvo) {
          // Fetch full conversation details
          const { data: fullConvo, error: fetchError } = await supabase
            .from('conversations')
            .select(`
              id,
              participants:conversation_participants(
                user_id,
                profile:profiles(
                  full_name,
                  avatar_url
                )
              )
            `)
            .eq('id', existingConvo.conversation_id)
            .single();

          if (fetchError) throw fetchError;

          if (fullConvo) {
            const transformedConvo: Conversation = {
              id: fullConvo.id,
              participants: transformParticipants(fullConvo.participants)
            };
            setSelectedConversation(transformedConvo);
            setIsNewChatOpen(false);
            return;
          }
        }
      }

      // Create new conversation
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convoError) throw convoError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: newConvo.id,
            user_id: user?.id,
            created_at: new Date().toISOString()
          },
          {
            conversation_id: newConvo.id,
            user_id: otherUser.id,
            created_at: new Date().toISOString()
          }
        ]);

      if (participantsError) throw participantsError;

      // Fetch the complete conversation
      const { data: updatedConvo, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          id,
          participants:conversation_participants(
            user_id,
            profile:profiles(
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', newConvo.id)
        .single();

      if (fetchError) throw fetchError;

      if (updatedConvo) {
        const transformedConvo: Conversation = {
          id: updatedConvo.id,
          participants: transformParticipants(updatedConvo.participants)
        };

        setConversations(prev => [transformedConvo, ...prev]);
        setSelectedConversation(transformedConvo);
        setIsNewChatOpen(false);
        
        toast({
          title: "Success",
          description: "New conversation started"
        });
      }
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-12 gap-6 max-w-6xl mx-auto">
          {/* Conversations List */}
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Messages</CardTitle>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          searchUsers(e.target.value);
                        }}
                      />
                      <Button size="icon" variant="ghost" disabled={isSearching}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[300px]">
                      {searchResults.map(result => (
                        <div
                          key={result.id}
                          className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                          onClick={() => startConversation(result)}
                        >
                          <Avatar>
                            <AvatarImage src={result.avatar_url || undefined} />
                            <AvatarFallback>
                              {result.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{result.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.email}
                            </p>
                          </div>
                        </div>
                      ))}
                      {searchTerm && !isSearching && searchResults.length === 0 && (
                        <p className="text-center text-muted-foreground p-4">
                          No users found
                        </p>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-accent rounded-lg mb-2 ${
                      selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    {conversation.participants
                      .filter(p => p.user_id !== user?.id)
                      .map(participant => (
                        <div key={participant.user_id} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={participant.profile.avatar_url || undefined} />
                            <AvatarFallback>
                              {participant.profile.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{participant.profile.full_name}</p>
                            {conversation.last_message && (
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.last_message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="col-span-8">
            <CardContent className="p-0">
              {selectedConversation ? (
                <div className="h-[600px] flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex mb-4 ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          } rounded-lg p-3`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </ScrollArea>

                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                      />
                      <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                  Select a conversation or start a new one
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 