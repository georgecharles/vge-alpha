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
      propertyId: string,
      userId: string,
      content: string,
    ) {
      const filteredContent = filterProfanity(content);

      const { data, error } = await supabase
        .from("property_comments")
        .insert([
          {
            property_id: propertyId,
            user_id: userId,
            content: filteredContent,
          },
        ])
        .select(
          `
          *,
          user:profiles!property_comments_user_id_fkey(full_name, email)
        `,
        )
        .single();

      if (error) throw error;
      return data;
    }

    export async function getPropertyComments(propertyId: string) {
      const { data, error } = await supabase
        .from("property_comments")
        .select(
          `
          *,
          user:profiles!property_comments_user_id_fkey(full_name, email)
        `,
        )
        .eq("property_id", propertyId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    }

    export async function deleteComment(commentId: string, userId: string) {
      const { error } = await supabase
        .from("property_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", userId);

      if (error) throw error;
    }
