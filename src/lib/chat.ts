const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const popularQuestions = [
  "Calculate stamp duty for a £400,000 property",
  "What are typical legal fees for property purchase?",
  "Explain all costs involved in buying a property",
  "How much should I budget for property maintenance?",
  "What surveys do I need when buying a property?",
  "Calculate monthly mortgage payments for £300,000",
];

export async function getChatResponse(message: string) {
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
                  text: `You are a UK property cost assistant specializing in helping users understand and calculate all costs involved in property transactions. You have expertise in:

1. Stamp Duty Land Tax calculations
2. Legal fees and conveyancing costs
3. Survey and valuation fees
4. Mortgage arrangement fees
5. Property maintenance costs
6. Insurance costs
7. Property management fees
8. Tax implications

Provide specific numbers and calculations when possible. For professional services, explain what to look for and typical cost ranges. Always break down complex costs into clear categories.

If asked about stamp duty, always show the calculation breakdown and mention if there are any special rates (e.g., first-time buyers, additional properties).

For maintenance costs, provide annual percentages of property value and specific examples of common maintenance items.

User question: ${message}`,
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
    console.error("Error getting chat response:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
}

export const formatMessage = (text: string) => {
  // Replace **bold** with styled spans
  let formattedText = text.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="font-bold">$1</span>'
  );
  
  // Replace *italic* with styled spans
  formattedText = formattedText.replace(
    /\*(.*?)\*/g,
    '<span class="italic">$1</span>'
  );
  
  // Replace bullet points
  formattedText = formattedText.replace(
    /^- (.+)$/gm,
    '<span class="block ml-2">• $1</span>'
  );
  
  // Replace numbered lists
  formattedText = formattedText.replace(
    /^\d+\. (.+)$/gm,
    '<span class="block ml-2">$&</span>'
  );

  // Split by newlines and wrap in spans
  return formattedText.split('\n').map((line, i) => (
    line ? `<span class="block">${line}</span>` : '<span class="block h-2"></span>'
  )).join('');
};

export async function getPredictiveAnalytics() {
  try {
    const response = await getChatResponse(`
      Analyze and predict the UK property market trends. Return the data in the following JSON format only:
      {
        "regions": [
          {
            "region": "London",
            "currentValue": 500000,
            "predictedValue": 525000,
            "confidence": 85,
            "growthFactors": [
              "Strong employment market",
              "Infrastructure developments",
              "High rental demand"
            ]
          }
        ]
      }
      Include predictions for: London, South East, North West, Scotland, Wales.
      Base predictions on current market data and trends.
      Ensure values are realistic and growth factors are specific.
      Return ONLY the JSON, no additional text.
    `);

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim().replace(/```json|```/g, '');
      return JSON.parse(cleanedResponse);
    } catch (e) {
      console.error("Failed to parse predictive data:", e);
      // Return fallback data
      return {
        regions: [
          {
            region: "London",
            currentValue: 500000,
            predictedValue: 525000,
            confidence: 85,
            growthFactors: ["Strong market fundamentals", "High demand", "Limited supply"]
          },
          // Add more fallback regions...
        ]
      };
    }
  } catch (error) {
    console.error("Error fetching predictive analytics:", error);
    return { regions: [] };
  }
}

export async function getInvestmentHotspots() {
  try {
    const response = await getChatResponse(`
      Identify the top UK property investment hotspots. Return the data in the following JSON format only:
      {
        "hotspots": [
          {
            "area": "Manchester",
            "score": 85,
            "factors": [
              "Strong student population",
              "Growing tech sector",
              "Improved transport links"
            ],
            "predictedGrowth": 7.5,
            "investmentType": "Residential"
          }
        ]
      }
      Include 5 top hotspots.
      Base analysis on economic indicators, infrastructure projects, and population trends.
      Investment types should be one of: "Residential", "Commercial", or "Mixed".
      Return ONLY the JSON, no additional text.
    `);

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim().replace(/```json|```/g, '');
      return JSON.parse(cleanedResponse);
    } catch (e) {
      console.error("Failed to parse hotspots data:", e);
      // Return fallback data
      return {
        hotspots: [
          {
            area: "Manchester",
            score: 85,
            factors: ["Strong economy", "University presence", "Infrastructure investment"],
            predictedGrowth: 7.5,
            investmentType: "Residential"
          },
          // Add more fallback hotspots...
        ]
      };
    }
  } catch (error) {
    console.error("Error fetching hotspots:", error);
    return { hotspots: [] };
  }
}
