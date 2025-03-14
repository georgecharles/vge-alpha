import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { Deal } from './deals';

const profanityList = [
  "badword1",
  "badword2",
  // Add more profanity words here
];

function filterProfanity(text: string): string {
  let filteredText = text.toLowerCase();
  profanityList.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filteredText = filteredText.replace(regex, "*".repeat(word.length));
  });
  return filteredText;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  deal_id?: string;
  created_at: string;
  is_read: boolean;
}

export interface MessageWithProfiles extends Message {
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  receiver: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  deal?: Deal;
}

// Define User interface for consistent typing
export interface User {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

// Define Conversation interface with proper User typing
export interface Conversation {
  user: User;
  lastMessage: MessageWithProfiles | null;
  unreadCount: number;
}

// Send a new message
export async function sendMessage(receiverId: string, content: string, dealId?: string): Promise<MessageWithProfiles | null> {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      console.error('Authentication error:', userError);
      throw new Error('User not authenticated');
    }

    console.log('Sending message:', {
      sender_id: user.user.id,
      receiver_id: receiverId,
      deal_id: dealId,
      content: content.substring(0, 20) + '...' // Log first 20 chars for privacy
    });

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.user.id,
        receiver_id: receiverId,
        content: filterProfanity(content),
        deal_id: dealId,
        is_read: false
      })
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url),
        receiver:profiles!receiver_id(id, full_name, avatar_url),
        deal:deals(*)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!data) {
      console.error('No data returned from insert');
      throw new Error('Failed to send message');
    }

    console.log('Message sent successfully:', { messageId: data.id });
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

// Get conversations for the current user
export async function getConversations(): Promise<Conversation[]> {
  try {
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in getConversations:', sessionError);
      return [];
    }
    
    // If no session from getSession, try getUser as fallback
    if (!session) {
      console.log('No active session found in getConversations - trying getUser fallback');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        console.error('User not authenticated in getConversations:', userError || 'No user data');
        return [];
      }
      
      const userId = userData.user.id;
      console.log(`Found user via getUser: ${userId}`);
      
      return await fetchConversationsForUser(userId);
    }
    
    // We have a session, use it for the query
    const userId = session.user.id;
    console.log(`Using session user for conversations: ${userId}`);
    
    return await fetchConversationsForUser(userId);
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

// Helper function to fetch conversations for a specific user ID
async function fetchConversationsForUser(userId: string): Promise<Conversation[]> {
  // Use the .filter() method with proper parameters
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(id, full_name, avatar_url),
      receiver:profiles!receiver_id(id, full_name, avatar_url),
      deal:deals(*)
    `)
    .filter('sender_id', 'eq', userId)
    .filter('receiver_id', 'eq', userId, { foreignTable: 'or' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Process conversations
  const conversationsMap = new Map<string, Conversation>();
  
  data?.forEach((message: MessageWithProfiles) => {
    const otherUser = message.sender_id === userId ? message.receiver : message.sender;
    const conversationId = otherUser.id;

    if (!conversationsMap.has(conversationId)) {
      conversationsMap.set(conversationId, {
        user: otherUser,
        lastMessage: message,
        unreadCount: message.receiver_id === userId && !message.is_read ? 1 : 0
      });
    } else if (message.receiver_id === userId && !message.is_read) {
      const conversation = conversationsMap.get(conversationId)!;
      conversation.unreadCount++;
    }
  });

  return Array.from(conversationsMap.values());
}

// Get messages between current user and another user
export async function getMessages(otherUserId: string): Promise<MessageWithProfiles[]> {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user.user) {
      console.error('Authentication error:', userError);
      throw new Error('User not authenticated');
    }

    console.log('Fetching messages with user:', otherUserId);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url),
        receiver:profiles!receiver_id(id, full_name, avatar_url),
        deal:deals(*)
      `)
      .or(`and(sender_id.eq.${user.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} messages`);

    // Mark messages as read
    const unreadMessages = data?.filter(
      (message) => message.receiver_id === user.user.id && !message.is_read
    ) || [];

    if (unreadMessages.length > 0) {
      console.log(`Marking ${unreadMessages.length} messages as read`);
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map((m) => m.id));

      if (updateError) {
        console.error('Error marking messages as read:', updateError);
      }
    }

    return data || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

// Subscribe to new messages
export function subscribeToMessages(callback: (message: MessageWithProfiles) => void) {
  try {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Fetch the complete message with profiles and deal
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id(id, full_name, avatar_url),
              receiver:profiles!receiver_id(id, full_name, avatar_url),
              deal:deals(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            callback(data);
          }
        }
      )
      .subscribe();

    return subscription;
  } catch (error) {
    console.error('Error subscribing to messages:', error);
    return null;
  }
}

// Mark message as read
export async function markMessageAsRead(messageId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

// Search users - helper function for finding users to message
export async function searchUsers(searchTerm: string) {
  try {
    let userId: string;
    
    // Try to get authentication info using both methods
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      userId = session.user.id;
      console.log(`Using session user for search: ${userId}`);
    } else {
      // Fallback to getUser
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        console.error('Failed to get authenticated user:', userError);
        throw new Error('Authentication required to search users');
      }
      
      userId = userData.user.id;
      console.log(`Using getUser result for search: ${userId}`);
    }
    
    // Start with the base query
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .neq('id', userId);
    
    // Add search filter if term is provided
    if (searchTerm && searchTerm.trim()) {
      const formattedTerm = `%${searchTerm.trim()}%`;
      
      // Use multiple .ilike() calls instead of .or() with string interpolation
      query = query.or(
        `full_name.ilike.${formattedTerm},email.ilike.${formattedTerm}`
      );
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error in searchUsers:', error);
      return [];
    }
    
    console.log(`Search found ${data?.length || 0} users`);
    return data || [];
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return [];
  }
}
