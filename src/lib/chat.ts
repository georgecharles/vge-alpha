import { useState } from 'react';

// Interface for chat responses
export interface ChatResponse {
  content: string;
  role: string;
}

// Function to get chat response with fallback
export async function getChatResponse(prompt: string): Promise<string> {
  try {
    // First try to call the API
    console.log("Calling chat API with prompt:", prompt);
    
    // Check if we're in development mode and should use mock data
    if (process.env.NODE_ENV === 'development' || import.meta.env.VITE_USE_MOCK_AI === 'true') {
      return getMockChatResponse(prompt);
    }
    
    // Update the API URL to use the correct Gemini endpoint and version
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      console.error("API error:", response.status, await response.text());
      throw new Error(`API error: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Sorry, I couldn't generate a response at this time.";
                   
    return content;
  } catch (error) {
    console.error("Error getting chat response:", error);
    
    // Fall back to mock response
    return getMockChatResponse(prompt);
  }
}

// Function to get predictive analytics with fallback
export async function getPredictiveAnalytics(location: string): Promise<any> {
  try {
    console.log("Getting predictive analytics for location:", location);
    
    // Use mock data in development mode
    if (process.env.NODE_ENV === 'development' || import.meta.env.VITE_USE_MOCK_AI === 'true') {
      return getMockPredictiveAnalytics(location);
    }
    
    // Update API endpoint to match the current Gemini structure
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    
    const prompt = `Generate predictive analytics for property investment in ${location} for the next 5 years. Include price growth predictions, rental yield trends, and market dynamics. Format as JSON with the following structure: {
      "priceGrowthPrediction": { "year1": 2.5, "year2": 3.1, "year3": 3.5, "year4": 2.8, "year5": 3.0 },
      "rentalYieldTrend": { "year1": 5.2, "year2": 5.3, "year3": 5.4, "year4": 5.3, "year5": 5.2 },
      "marketSummary": "Brief summary of market dynamics",
      "keyFactors": ["Factor 1", "Factor 2", "Factor 3"]
    }`;
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API response was not ok`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    
    if (!content) throw new Error("No content returned from API");
    
    // Extract JSON from the response
    let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                    content.match(/```([\s\S]*?)```/) ||
                    content.match(/(\{[\s\S]*\})/);
                    
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    } else {
      // Try parsing the whole response if no JSON block is found
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("Error parsing predictive analytics:", e);
        return getMockPredictiveAnalytics(location);
      }
    }
  } catch (error) {
    console.error("Error fetching predictive analytics:", error);
    return getMockPredictiveAnalytics(location);
  }
}

// Function to get investment hotspots with fallback
export async function getInvestmentHotspots(region: string): Promise<any> {
  try {
    console.log("Getting investment hotspots for region:", region);
    
    // Use mock data in development mode
    if (process.env.NODE_ENV === 'development' || import.meta.env.VITE_USE_MOCK_AI === 'true') {
      return getMockHotspots(region);
    }
    
    // Update API endpoint to match the current Gemini structure
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    
    const prompt = `Generate a list of emerging property investment hotspots in ${region} with reasons why they are promising. Format as JSON with the following structure: 
    {
      "hotspots": [
        {
          "area": "Area name",
          "growthPotential": 4.2,
          "reasons": ["Reason 1", "Reason 2"],
          "estimatedROI": 5.8,
          "investmentType": "Buy-to-let"
        }
      ]
    }
    Include 3-5 different hotspots.`;
    
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API response was not ok`);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    
    if (!content) throw new Error("No content returned from API");
    
    // Extract JSON from the response
    let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                    content.match(/```([\s\S]*?)```/) ||
                    content.match(/(\{[\s\S]*\})/);
                    
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    } else {
      // Try parsing the whole response if no JSON block is found
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse hotspots:", e);
        return getMockHotspots(region);
      }
    }
  } catch (error) {
    console.error("Failed to fetch hotspots:", error);
    return getMockHotspots(region);
  }
}

// Mock functions to provide fallback data
function getMockChatResponse(prompt: string): string {
  if (prompt.includes("market insights")) {
    return "Based on recent data, the property market in this area has shown strong growth over the past 12 months. Average prices have increased by approximately 7.3%, which is above the national average of 4.5%. Rental yields remain competitive at around 5.2% for typical properties. The local economy is benefiting from new infrastructure projects and employment opportunities, which should provide continued stability. Demand currently exceeds supply, especially for 2-3 bedroom properties, creating a seller's market. Analysts predict continued but more moderate growth over the next 24 months.";
  } else if (prompt.includes("investment advice")) {
    return "For property investors looking at this market, there are several strategies worth considering:\n\n1. Buy-to-let opportunities are particularly strong in the north and east neighborhoods, where rental demand from young professionals is high.\n\n2. Properties requiring renovation can offer significant value-add opportunities, with potential for 15-20% equity gains after improvements.\n\n3. The local council has approved new development zones which may present off-plan purchase opportunities with favorable terms.\n\n4. Houses with potential for extension or conversion to multiple units can maximize returns in areas with strict planning constraints.\n\n5. Consider the strong local university market for HMO investments, which typically yield 2-3% higher than standard rentals.";
  } else {
    return "The current property market shows mixed signals. While some areas continue to see price growth, others have stabilized. Factors influencing the market include interest rate changes, supply constraints, and evolving work patterns affecting location preferences. For specific investment advice, consider local economic indicators, infrastructure developments, and demographic trends particular to your target area.";
  }
}

function getMockPredictiveAnalytics(location: string): any {
  return {
    priceGrowthPrediction: {
      year1: 3.2,
      year2: 3.5,
      year3: 4.1,
      year4: 3.8,
      year5: 3.9
    },
    rentalYieldTrend: {
      year1: 5.3,
      year2: 5.4,
      year3: 5.5,
      year4: 5.4,
      year5: 5.3
    },
    marketSummary: `The property market in ${location} shows promising growth potential over the next 5 years, supported by infrastructure development and increasing demand. While some volatility is expected in years 2-3, the overall trajectory remains positive.`,
    keyFactors: [
      "New transportation links improving connectivity",
      "Growing tech sector bringing high-income professionals to the area",
      "Limited new housing supply in development pipeline",
      "Strong rental demand from young professionals",
      "Government stimulus for first-time buyers"
    ]
  };
}

function getMockHotspots(region: string): any {
  return {
    hotspots: [
      {
        area: `${region} - North District`,
        growthPotential: 4.7,
        reasons: [
          "New tech hub development creating employment",
          "Improved transport links reducing commute times",
          "Regeneration project transforming former industrial areas"
        ],
        estimatedROI: 6.2,
        investmentType: "Buy-to-let apartments"
      },
      {
        area: `${region} - Riverside`,
        growthPotential: 5.1,
        reasons: [
          "Waterfront development project nearing completion",
          "Limited supply of premium properties",
          "Growing demand from young professionals"
        ],
        estimatedROI: 5.8,
        investmentType: "Luxury apartments"
      },
      {
        area: `${region} - University Area`,
        growthPotential: 3.9,
        reasons: [
          "Consistent student housing demand",
          "University expansion plans announced",
          "Improving local amenities and nightlife"
        ],
        estimatedROI: 7.3,
        investmentType: "HMO for students"
      },
      {
        area: `${region} - Central Village`,
        growthPotential: 4.5,
        reasons: [
          "Character properties with renovation potential",
          "Growing tourism supporting short-term rentals",
          "New boutique retail and restaurant scene"
        ],
        estimatedROI: 6.5,
        investmentType: "Period conversions"
      }
    ]
  };
}

// React hook for using chat responses
export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getChatResponse(message);
      setResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    response,
    isLoading,
    error
  };
}

export const popularQuestions = [
  "Calculate stamp duty for a £400,000 property",
  "What are typical legal fees for property purchase?",
  "Explain all costs involved in buying a property",
  "How much should I budget for property maintenance?",
  "What surveys do I need when buying a property?",
  "Calculate monthly mortgage payments for £300,000",
];

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

