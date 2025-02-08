import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateMarketInsights() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
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
                  text: `Analyze the current UK property market. Focus on:
              1. Latest interest rate changes and their impact
              2. House price trends in major cities
              3. Market sentiment and predictions
              4. Key factors affecting the market
              5. Investment opportunities
              
              Provide a concise, data-driven analysis with specific numbers and trends.`,
                },
              ],
            },
          ],
        }),
      },
    );
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating insights:", error);
    return null;
  }
}

const handler: Handler = async (event) => {
  // Only allow POST requests from Netlify's cron job
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // Generate new insights
    const insights = await generateMarketInsights();
    if (!insights) throw new Error("Failed to generate insights");

    // Store in Supabase
    const { error } = await supabase.from("market_insights").insert([
      {
        content: insights,
        generated_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error updating market insights:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update market insights" }),
    };
  }
};

export { handler };
