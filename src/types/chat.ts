export interface Message {
  id?: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  created_at?: string;
  is_support?: boolean;
} 