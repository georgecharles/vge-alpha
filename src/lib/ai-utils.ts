// Import type only to avoid build issues
import type { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

async function initializeAI() {
  if (!genAI) {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  }
  return genAI;
}

function sanitizeJsonString(str: string): string {
  // Find the first { and last } to extract just the JSON object
  const start = str.indexOf('{');
  const end = str.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) throw new Error("Invalid JSON response");
  return str.slice(start, end);
}

export async function getInvestmentAnalysis(propertyType: string, budget: number) {
  const ai = await initializeAI();
  const model = ai.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are a UK property investment expert. Analyze investment opportunities for ${propertyType} properties with a budget of £${budget}.
    Respond with a JSON object containing ONLY these exact fields:
    {
      "analysis": "Brief overview of the investment opportunity",
      "roi_range": "Expected ROI range as a percentage",
      "risks": ["Risk 1", "Risk 2", "Risk 3"],
      "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
      "market_trends": ["Trend 1", "Trend 2", "Trend 3"]
    }
    Ensure each array has exactly 3 items and all fields are present.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = sanitizeJsonString(response.text().trim());
    console.log('Raw Analysis Response:', text);
    
    const parsedData = JSON.parse(text);
    
    // Validate the response structure
    if (!parsedData.analysis || !parsedData.roi_range || 
        !Array.isArray(parsedData.risks) || !Array.isArray(parsedData.opportunities) || 
        !Array.isArray(parsedData.market_trends)) {
      throw new Error('Invalid response format');
    }

    return {
      analysis: parsedData.analysis,
      roi_range: parsedData.roi_range,
      risks: parsedData.risks.slice(0, 3),
      opportunities: parsedData.opportunities.slice(0, 3),
      market_trends: parsedData.market_trends.slice(0, 3)
    };
  } catch (error) {
    console.error("Error in getInvestmentAnalysis:", error);
    return {
      analysis: `Analysis for ${propertyType} properties with £${budget} budget is currently unavailable`,
      roi_range: "8-12%",
      risks: [
        "Market volatility",
        "Economic uncertainty",
        "Property condition risks"
      ],
      opportunities: [
        "Value appreciation potential",
        "Rental income opportunities",
        "Development possibilities"
      ],
      market_trends: [
        "Rising demand in key areas",
        "Stable price growth",
        "Infrastructure development"
      ]
    };
  }
}

export async function getMarketPredictions(location: string) {
  const ai = await initializeAI();
  const model = ai.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are a UK property market expert. Predict property market trends for ${location} in the next 12 months.
    Respond ONLY with a JSON object in this exact format:
    {
      "price_prediction": "2-3 sentence prediction of price movements",
      "demand_factors": ["3 specific demand factors"],
      "recommendations": ["3 specific investment recommendations"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = sanitizeJsonString(response.text().trim());
    console.log('Raw Predictions Response:', text);
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in getMarketPredictions:", error);
    return {
      price_prediction: "Market prediction currently unavailable",
      demand_factors: ["Population growth", "Economic development", "Infrastructure improvements"],
      recommendations: ["Research thoroughly", "Consider long-term potential", "Evaluate local amenities"]
    };
  }
}

export async function getInvestmentStrategy(investorProfile: any) {
  const ai = await initializeAI();
  const model = ai.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are a UK property investment advisor. Create a strategy for a ${investorProfile.experience} investor with £${investorProfile.budget} budget and ${investorProfile.riskTolerance} risk tolerance.
    Respond ONLY with a JSON object in this exact format:
    {
      "strategy": "2-3 sentence overview of recommended strategy",
      "portfolio_allocation": "Suggested portfolio breakdown percentages",
      "timeline": "Recommended investment timeline",
      "expected_returns": "Projected returns overview"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = sanitizeJsonString(response.text().trim());
    console.log('Raw Strategy Response:', text);
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in getInvestmentStrategy:", error);
    return {
      strategy: "Investment strategy currently unavailable",
      portfolio_allocation: "Residential: 60%, Commercial: 30%, Cash: 10%",
      timeline: "5-10 years recommended holding period",
      expected_returns: "8-12% annual return potential"
    };
  }
} 