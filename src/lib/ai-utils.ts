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

export async function getPropertyAnalysis(property: any) {
  const ai = await initializeAI();
  const model = ai.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    As a UK property expert, analyze this property:
    Property Type: ${property.property_type}
    Details: ${property.bedroom} bedrooms, ${property.bathroom} bathrooms
    Size: ${property.square_footage} sq ft
    Location: ${property.city}
    Price: £${property.price}

    Respond with a JSON object in exactly this format:
    {
      "market_value_analysis": "Brief analysis of the property's market value",
      "investment_potential": "Analysis of investment potential",
      "key_advantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
      "considerations": ["Consideration 1", "Consideration 2", "Consideration 3"],
      "recommendation": "Brief recommendation"
    }
    Keep the response strictly in this JSON format with no additional text.
  `;

  try {
    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    console.log('Raw Gemini response:', text);
    
    // Clean and parse the response
    const cleanedText = sanitizeJsonString(text);
    console.log('Cleaned response:', cleanedText);
    
    const parsedData = JSON.parse(cleanedText);
    
    // Validate the response structure
    if (!parsedData.market_value_analysis || 
        !parsedData.investment_potential || 
        !Array.isArray(parsedData.key_advantages) || 
        !Array.isArray(parsedData.considerations) || 
        !parsedData.recommendation) {
      console.error('Invalid response structure:', parsedData);
      throw new Error('Invalid response structure from AI');
    }

    return {
      market_value_analysis: parsedData.market_value_analysis,
      investment_potential: parsedData.investment_potential,
      key_advantages: parsedData.key_advantages.slice(0, 3),
      considerations: parsedData.considerations.slice(0, 3),
      recommendation: parsedData.recommendation
    };
  } catch (error) {
    console.error("Error in getPropertyAnalysis:", error);
    console.error("Property data:", property);
    
    // More specific fallback data based on the property
    return {
      market_value_analysis: `This ${property.property_type} property in ${property.city} requires detailed market analysis.`,
      investment_potential: `${property.bedroom} bedroom property with potential for rental or resale value appreciation.`,
      key_advantages: [
        `${property.bedroom} bedrooms suitable for the local market`,
        `${property.square_footage} sq ft offering good space`,
        `Located in ${property.city}`
      ],
      considerations: [
        "Current market conditions",
        "Property condition assessment needed",
        "Local area development plans"
      ],
      recommendation: `Consider viewing this ${property.property_type} property for a detailed assessment.`
    };
  }
} 