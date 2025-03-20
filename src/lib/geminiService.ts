import { RightmoveProperty } from './apifyRightmoveScraper';

// Get the Gemini API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if API key is configured
const isGeminiConfigured = !!GEMINI_API_KEY;
console.log('Gemini API status:', isGeminiConfigured ? 'Configured' : 'Not configured');

// Interface for investment analysis results
export interface PropertyInvestmentAnalysis {
  estimatedRent: number;
  rentalYield: number;
  cashFlow: number;
  capRate: number;
  roiFirstYear: number;
  breakEvenPoint: number;
  suggestedOfferPrice: number;
  commentary: string;
}

// Function to analyze a property using Gemini API
export const analyzePropertyInvestment = async (property: any): Promise<PropertyInvestmentAnalysis> => {
  // Implement actual analysis logic here
  // This is a placeholder that would normally use an API call to Gemini
  return mockInvestmentAnalysis(property);
};

// Helper function to construct the prompt for Gemini
const constructPropertyAnalysisPrompt = (property: RightmoveProperty): string => {
  return `
  Analyze this UK property for investment potential:
  
  Property details:
  - Address: ${property.address}
  - Postcode: ${property.postcode}
  - Price: £${property.price.toLocaleString()}
  - Property type: ${property.property_type}
  - Bedrooms: ${property.bedrooms}
  - Bathrooms: ${property.bathrooms || 'Unknown'}
  - Description: ${property.description}
  - Tenure: ${property.tenure || 'Unknown'}
  - New build: ${property.new_build ? 'Yes' : 'No'}
  ${property.floor_area ? `- Floor area: ${property.floor_area.size} ${property.floor_area.unit}` : ''}
  
  For this property, provide a comprehensive investment analysis in JSON format with the following structure:
  {
    "estimatedRentalYield": [a percentage number, typical UK yields range from 3-10%],
    "estimatedROI": [a percentage number],
    "estimatedCashFlow": [monthly cash flow in pounds],
    "estimatedAnnualProfit": [yearly profit in pounds],
    "estimatedCapRate": [capitalization rate as a percentage],
    "suitableStrategies": [array of strings like "Buy-to-Let", "HMO", "BRRR", "Serviced Accommodation", "Rent-to-Rent", "Flip", "Development"],
    "strategyRecommendations": [
      {
        "strategy": [strategy name],
        "score": [score from 1-10],
        "reasoning": [short explanation]
      }
    ],
    "marketTrends": [description of local market trends],
    "propertyPotential": [analysis of property's investment potential],
    "renovationOpportunities": [ideas for value-adding renovations],
    "riskAssessment": [potential risks for investors],
    "estimatedRenovationCost": [estimated cost of recommended renovations in pounds],
    "areaGrowthPotential": [estimated annual growth percentage for the area],
    "areaInvestmentRating": [score from 1-10 for the area's investment potential],
    "areaDescription": [brief description of the area's investment merits]
  }
  
  Be realistic and specific with your analysis. Base your recommendations on property type, location, and current UK property investment trends. Use real-world knowledge of UK property markets and investment strategies.
  `;
};

// Helper function to parse Gemini's response
const parseGeminiResponse = (responseText: string, property: RightmoveProperty): PropertyInvestmentAnalysis => {
  try {
    console.log('Parsing Gemini response...');
    
    // Extract the JSON part from response (it might include additional text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response');
      throw new Error('No JSON found in response');
    }
    
    const jsonStr = jsonMatch[0];
    console.log('Extracted JSON data from response');
    
    let analysisData;
    try {
      analysisData = JSON.parse(jsonStr);
      console.log('Successfully parsed JSON data');
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      throw new Error('Invalid JSON format in response');
    }
    
    // Log the parsed data for debugging
    console.log('Parsed analysis data (sample):', {
      estimatedRentalYield: analysisData.estimatedRentalYield,
      estimatedROI: analysisData.estimatedROI,
      estimatedCashFlow: analysisData.estimatedCashFlow
    });
    
    // Validate numeric fields and ensure they are numbers
    const validateNumber = (value: any, defaultValue: number = 0): number => {
      if (value === undefined || value === null) return defaultValue;
      
      // Handle values that might be strings
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      
      // Check if it's a valid number
      return isNaN(numValue) ? defaultValue : numValue;
    };
    
    // Ensure all expected fields are present and valid
    return {
      estimatedRent: validateNumber(analysisData.estimatedRentalYield),
      rentalYield: validateNumber(analysisData.estimatedROI),
      cashFlow: validateNumber(analysisData.estimatedCashFlow),
      capRate: validateNumber(analysisData.estimatedCapRate),
      roiFirstYear: validateNumber(analysisData.estimatedROI),
      breakEvenPoint: validateNumber(analysisData.estimatedCashFlow),
      suggestedOfferPrice: validateNumber(analysisData.estimatedCashFlow),
      commentary: analysisData.marketTrends || '',
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return mockInvestmentAnalysis(property);
  }
};

// Generate mock investment analysis for testing or when API is unavailable
export const mockInvestmentAnalysis = (property: any): PropertyInvestmentAnalysis => {
  console.log('Generating mock investment analysis for property:', property.id);
  
  // Generate realistic values based on property price
  const price = property.price || 250000;
  const bedrooms = property.bedrooms || 2;
  
  // Calculate estimated monthly rent (roughly 0.4-0.6% of property value depending on bedrooms)
  const rentFactor = 0.004 + (bedrooms * 0.0001); // Adjust rent by bedroom count
  const estimatedRent = Math.round(price * rentFactor);
  
  // Annual gross rental income
  const annualRent = estimatedRent * 12;
  
  // Rental yield (annual rent / property price)
  const rentalYield = +(((annualRent / price) * 100).toFixed(2));
  
  // Estimated annual expenses (maintenance, management, etc.)
  const expenses = annualRent * 0.3; // About 30% of rental income
  
  // Cash flow (annual income - expenses)
  const annualCashFlow = annualRent - expenses;
  const monthlyCashFlow = Math.round(annualCashFlow / 12);
  
  // Cap rate (annual net income / property price)
  const capRate = +(((annualCashFlow / price) * 100).toFixed(2));
  
  // First year ROI (cash flow / down payment)
  const downPayment = price * 0.25; // Assume 25% down payment
  const roiFirstYear = +(((annualCashFlow / downPayment) * 100).toFixed(2));
  
  // Break even point (years)
  const breakEvenPoint = +(((price - (price * 0.7)) / annualCashFlow).toFixed(1)); // Accounting for 70% LTV mortgage
  
  // Suggested offer price (usually 5-10% below asking depending on market conditions)
  const discount = 0.05 + (Math.random() * 0.05);
  const suggestedOfferPrice = Math.round(price * (1 - discount));
  
  return {
    estimatedRent,
    rentalYield,
    cashFlow: monthlyCashFlow,
    capRate,
    roiFirstYear,
    breakEvenPoint,
    suggestedOfferPrice,
    commentary: `This ${property.property_type} in ${property.address} could generate approximately £${estimatedRent} per month in rent, yielding a ${rentalYield}% rental yield. With estimated monthly cash flow of £${monthlyCashFlow} after expenses, you could break even in around ${breakEvenPoint} years. Consider offering around £${suggestedOfferPrice} for this property.`
  };
};

// Function to test if the Gemini API is properly configured
export const testGeminiAPI = async (): Promise<{ success: boolean; message: string }> => {
  if (!isGeminiConfigured) {
    return { 
      success: false, 
      message: 'Gemini API key not configured. Set VITE_GEMINI_API_KEY in your .env file.' 
    };
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=${GEMINI_API_KEY}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        message: `API test failed: ${response.status} ${response.statusText} - ${errorText}` 
      };
    }
    
    return { 
      success: true, 
      message: 'Gemini API connection successful' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `API test failed with error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}; 