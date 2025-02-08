import { supabase } from "./supabase";

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

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
) {
  const filteredContent = filterProfanity(content);

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content: filteredContent,
      },
    ])
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(full_name, email),
      receiver:profiles!messages_receiver_id_fkey(full_name, email)
    `,
    )
    .single();

  if (error) throw error;
  return data;
}

export async function getConversation(userId: string, otherId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(full_name, email),
      receiver:profiles!messages_receiver_id_fkey(full_name, email)
    `,
    )
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`,
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getUserConversations(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(full_name, email),
      receiver:profiles!messages_receiver_id_fkey(full_name, email)
    `,
    )
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
