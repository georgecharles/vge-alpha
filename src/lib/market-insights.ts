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

    export async function generatePriceForecast(area: string) { // Existing function
      try {
        const prompt = `Predict the 1-year property price forecast for ${area}, UK.
        Consider historical price data, current market trends, interest rate forecasts, and economic indicators.
        Provide a concise summary including percentage change and key factors driving the prediction.`;

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
                      text: prompt,
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
          throw new Error("Invalid response format from Gemini API for forecast");
        }

        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error("Error generating price forecast:", error);
        return "Failed to generate price forecast. Please try again later.";
      }
    }

    export async function generateInvestmentHotspots(area: string) { // Existing function
      try {
        const prompt = `Identify top 3 emerging property investment hotspots in the ${area}, UK, for 2024-2025.
        Analyze demographic trends, economic growth indicators, infrastructure developments, and average property price growth over the last 3 years.
        Provide a concise summary for each hotspot, highlighting key factors making them attractive for investment, including specific postcodes or areas if possible.
        Format as a list of hotspot names, each followed by a paragraph of analysis.`;

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
                      text: prompt,
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
          throw new Error("Invalid response format from Gemini API for hotspots");
        }

        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error("Error generating investment hotspots:", error);
        return "Failed to generate investment hotspots. Please try again later.";
      }
    }

    export async function generateTrendIdentification(area: string) { // Existing function
      try {
        const prompt = `Identify 3 key emerging trends in the UK real estate market for 2024-2025.
        Focus on shifts in demand for property types (e.g., detached houses, apartments, bungalows) and identify any emerging high-growth neighborhoods across the UK.
        Analyze factors such as changing buyer preferences, lifestyle shifts, remote work impact, and regional economic forecasts.
        Provide a concise summary for each trend, explaining the trend and its implications for property investors.`;


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
                      text: prompt,
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
          throw new Error("Invalid response format from Gemini API for trend identification");
        }

        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error("Error generating trend identification:", error);
        return "Failed to generate trend identification. Please try again later.";
      }
    }

    export async function generateEconomicIndicatorAnalysis(area: string) { // New function
      try {
        const prompt = `Analyze the current UK economic indicators and their potential impact on the UK real estate market for 2024-2025.
        Focus on:
        1. Interest Rates: Current levels and predicted changes, impact on mortgage affordability and buyer demand.
        2. Employment Rates: Current employment trends, job growth/decline in key sectors, and impact on housing demand.
        3. GDP Growth: Current GDP growth rate, forecasts for the next year, and correlation with property market health.

        Provide a concise analysis summarizing the overall UK property market health based on these economic indicators and suggest potential implications for property investors.`;


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
                      text: prompt,
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
          throw new Error("Invalid response format from Gemini API for economic indicator analysis");
        }

        return data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error("Error generating economic indicator analysis:", error);
        return "Failed to generate economic indicator analysis. Please try again later.";
      }
    }
