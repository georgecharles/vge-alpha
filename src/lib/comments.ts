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

export async function addComment(
  dealId: string,
  userId: string,
  content: string,
) {
  const filteredContent = filterProfanity(content);

  const { data, error } = await supabase
    .from("deal_comments")
    .insert([
      {
        deal_id: dealId,
        user_id: userId,
        content: filteredContent,
      },
    ])
    .select(
      `
      *,
      user:profiles!deal_comments_user_id_fkey(full_name, email)
    `,
    )
    .single();

  if (error) throw error;
  return data;
}

export async function getPropertyComments(dealId: string) {
  const { data, error } = await supabase
    .from("deal_comments")
    .select(
      `
      *,
      user:profiles!deal_comments_user_id_fkey(full_name, email)
    `,
    )
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function deleteComment(commentId: string, userId: string) {
  const { error } = await supabase
    .from("deal_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) throw error;
}
