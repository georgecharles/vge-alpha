import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function sanitizeJsonString(str: string): string {
  // Find the first { and last } to extract just the JSON object
  const start = str.indexOf('{');
  const end = str.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) throw new Error("Invalid JSON response");
  return str.slice(start, end);
}

export async function getInvestmentAnalysis(propertyType: string, budget: number) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are a UK property investment expert. Analyze investment opportunities for ${propertyType} properties with a budget of £${budget}.
    Respond ONLY with a JSON object in this exact format:
    {
      "analysis": "2-3 sentence overview of the investment opportunity",
      "roi_range": "Expected ROI range as a percentage (e.g., '8-12%')",
      "risks": ["3 specific risks"],
      "opportunities": ["3 specific opportunities"],
      "market_trends": ["3 current market trends"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = sanitizeJsonString(response.text().trim());
    console.log('Raw Analysis Response:', text);
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in getInvestmentAnalysis:", error);
    return {
      analysis: "Investment analysis currently unavailable",
      roi_range: "8-12%",
      risks: ["Market volatility", "Economic uncertainty", "Property condition risks"],
      opportunities: ["Value appreciation", "Rental income", "Development potential"],
      market_trends: ["Rising demand", "Price stability", "Urban regeneration"]
    };
  }
}

export async function getMarketPredictions(location: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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