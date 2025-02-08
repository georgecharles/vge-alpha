import { supabase } from "./supabase";

export async function fetchPropertyNews() {
  return [
    {
      title: "UK Housing Market Shows Signs of Recovery",
      description:
        "Recent data indicates a steady increase in property transactions...",
      url: "#",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Interest Rates Impact on Property Market",
      description:
        "Bank of England's latest decision affects mortgage rates...",
      url: "#",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Regional Property Markets Outperform London",
      description: "Northern cities show strong growth in property values...",
      url: "#",
      publishedAt: new Date().toISOString(),
    },
  ];
}

export async function generateMarketInsights(prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from Gemini API");
    }

    const insights = data.candidates[0].content.parts[0].text;
    await storeMarketInsights(insights);
    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
}

export async function storeMarketInsights(insights: string) {
  const { error } = await supabase.from("market_insights").insert([
    {
      content: insights,
      generated_at: new Date().toISOString(),
    },
  ]);

  if (error) throw error;
}

export async function getLatestMarketInsights() {
  try {
    const { data, error } = await supabase
      .from("market_insights")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching market insights:", error);
    return null;
  }
}
