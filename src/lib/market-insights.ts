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
    const formattedPrompt = `${prompt}

Provide a detailed analysis using EXACTLY this format (do not include numbers or asterisks at the start of sections):

## Latest Tax Law Changes
- The current stamp duty rates and thresholds
- Recent changes to capital gains tax
- Upcoming tax proposals

## Landlord Regulations
- Latest HMO licensing requirements
- Recent changes to tenant rights
- Current safety regulations

## Government Policies
- New housing policies
- Regional development initiatives
- Planning permission changes

## Market Impact Analysis
- Effect on property values
- Changes to rental yields
- Investment recommendations

Use ONLY ## for section headers and - for bullet points. Do not use any other formatting, numbers, or special characters. Each bullet point should be a complete sentence with specific dates and numbers where possible.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
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
                  text: formattedPrompt,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from Gemini API");
    }

    // Clean up the response to ensure proper formatting
    let insights = data.candidates[0].content.parts[0].text;
    insights = insights
      .replace(/\*\*/g, "") // Remove any asterisks
      .replace(/\*\s/g, "- ") // Replace any remaining asterisk bullets with dashes
      .replace(/\d+\.\s/g, "- ") // Replace numbered lists with bullet points
      .replace(/^[0-9]\./gm, "-") // Replace numbers at start of lines with dashes
      .replace(/\n\n+/g, "\n\n") // Normalize line spacing
      .replace(/\n\s*\n/g, "\n\n") // Fix multiple blank lines
      .trim();

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

export async function getRiskAssessment() {
  try {
    const response = await fetch(
      `https://your-api-endpoint.com/risk-assessment?key=${import.meta.env.VITE_GEMINI_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Ensure this returns a string or the expected format
  } catch (error) {
    console.error("Error fetching risk assessment:", error);
    return "No risk assessment data available."; // Return a default message or value
  }
}

export async function getPersonalizedOpportunities() {
  try {
    const response = await fetch(
      `https://your-api-endpoint.com/personalized-opportunities?key=${import.meta.env.VITE_GEMINI_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Ensure this returns an array of opportunities
  } catch (error) {
    console.error("Error fetching personalized opportunities:", error);
    return []; // Return an empty array as a fallback
  }
}

export async function getPredictiveAnalytics() {
  try {
    const response = await fetch(
      `https://your-api-endpoint.com/predictive-analytics?key=${import.meta.env.VITE_GEMINI_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data; // Ensure this returns the expected format
  } catch (error) {
    console.error("Error fetching predictive analytics:", error);
    return {}; // Return an empty object or default value
  }
}
