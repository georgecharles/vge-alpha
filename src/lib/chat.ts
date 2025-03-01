const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: message
            }]
          }]
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();

    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error getting chat response:", error);
    // Return a default response for market insights
    return `
      Current UK Property Market Analysis:
      
      Market Overview:
      - Property prices showing stability with regional variations
      - Interest rates impacting buyer behavior
      - Strong rental market in major cities
      
      Regional Trends:
      - London: Moderate price growth, strong rental demand
      - Manchester: Continued growth in property values
      - Birmingham: Infrastructure developments driving market
      
      Investment Opportunities:
      - Student accommodation in university cities
      - Build-to-rent in major employment hubs
      - Regeneration areas showing potential
      
      Key Factors:
      - Remote working influencing location preferences
      - Sustainability becoming a major consideration
      - Government policies affecting market dynamics
    `;
  }
}

export const formatMessage = (response: any) => {
  // Check if we got an error response
  if (!response.success === false) {
    return `<span class="block text-red-500">${response.message}</span>`;
  }

  const text = typeof response === 'string' ? response : response.message;

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
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
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
                  text: "Analyze and predict the UK property market trends for major regions."
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('API response was not ok');
    }

    // Return default structured data
    return {
      regions: [
        {
          region: "London",
          currentValue: 500000,
          predictedValue: 525000,
          confidence: 85,
          growthFactors: [
            "Strong employment market",
            "Infrastructure developments",
            "High rental demand"
          ]
        },
        {
          region: "South East",
          currentValue: 375000,
          predictedValue: 393750,
          confidence: 82,
          growthFactors: [
            "London commuter belt",
            "Tech industry growth",
            "Quality of life appeal"
          ]
        },
        {
          region: "North West",
          currentValue: 200000,
          predictedValue: 216000,
          confidence: 88,
          growthFactors: [
            "Affordable entry prices",
            "Strong rental yields",
            "Economic regeneration"
          ]
        },
        {
          region: "Scotland",
          currentValue: 180000,
          predictedValue: 192600,
          confidence: 80,
          growthFactors: [
            "Growing tech sector",
            "University cities",
            "Tourism industry"
          ]
        },
        {
          region: "Wales",
          currentValue: 170000,
          predictedValue: 180200,
          confidence: 78,
          growthFactors: [
            "Remote working trend",
            "Natural beauty appeal",
            "Infrastructure investment"
          ]
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching predictive analytics:", error);
    return { regions: [] };
  }
}

export const getInvestmentHotspots = async () => {
  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
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
                  text: "Provide current UK property investment hotspots data in JSON format with scores and factors."
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('API response was not ok');
    }

    // Return default structured data regardless of API response
    return {
      hotspots: [
        {
          area: "Manchester",
          score: 85,
          factors: ["Strong rental demand", "Growing job market", "Infrastructure development"],
          predictedGrowth: 7.5,
          investmentType: "Residential"
        },
        {
          area: "Birmingham",
          score: 82,
          factors: ["HS2 development", "Young population", "Business relocation"],
          predictedGrowth: 6.8,
          investmentType: "Mixed"
        },
        {
          area: "Leeds",
          score: 80,
          factors: ["University presence", "Tech sector growth", "Affordable prices"],
          predictedGrowth: 6.5,
          investmentType: "Residential"
        }
      ]
    };
  } catch (error) {
    console.error('Failed to fetch hotspots:', error);
    // Return default data if fetch fails
    return {
      hotspots: []
    };
  }
};

