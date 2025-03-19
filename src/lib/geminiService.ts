import { RightmoveProperty } from './apifyRightmoveScraper';

// Get the Gemini API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if API key is configured
const isGeminiConfigured = !!GEMINI_API_KEY;
console.log('Gemini API status:', isGeminiConfigured ? 'Configured' : 'Not configured');

// Interface for investment analysis results
export interface PropertyInvestmentAnalysis {
  // Financial metrics
  estimatedRentalYield: number;
  estimatedROI: number;
  estimatedCashFlow: number;
  estimatedAnnualProfit: number;
  estimatedCapRate: number;
  
  // Investment strategies
  suitableStrategies: string[];
  strategyRecommendations: {
    strategy: string;
    score: number;
    reasoning: string;
  }[];
  
  // Property-specific insights
  marketTrends: string;
  propertyPotential: string;
  renovationOpportunities: string;
  riskAssessment: string;
  estimatedRenovationCost: number;
  
  // Area insights
  areaGrowthPotential: number; // Percentage
  areaInvestmentRating: number; // 1-10
  areaDescription: string;
}

// Function to analyze a property using Gemini API
export const analyzePropertyInvestment = async (
  property: RightmoveProperty
): Promise<PropertyInvestmentAnalysis> => {
  // Log the property being analyzed
  console.log('Analyzing property for investment:', {
    id: property.id,
    price: property.price,
    address: property.address
  });
  
  // If Gemini isn't configured, return mock data
  if (!isGeminiConfigured) {
    console.log('Using mock investment analysis data (no Gemini API key configured)');
    return generateMockAnalysis(property);
  }
  
  try {
    // Construct the prompt for Gemini API
    const prompt = constructPropertyAnalysisPrompt(property);
    
    // Call Gemini API
    console.log('Calling Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Gemini API response received');
    
    // Parse the response to extract structured investment analysis
    const analysisText = data.candidates[0].content.parts[0].text;
    return parseGeminiResponse(analysisText, property);
  } catch (error) {
    console.error('Error analyzing property with Gemini:', error);
    // Fall back to mock data in case of error
    console.log('Falling back to mock data due to API error');
    return generateMockAnalysis(property);
  }
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
      estimatedRentalYield: validateNumber(analysisData.estimatedRentalYield),
      estimatedROI: validateNumber(analysisData.estimatedROI),
      estimatedCashFlow: validateNumber(analysisData.estimatedCashFlow),
      estimatedAnnualProfit: validateNumber(analysisData.estimatedAnnualProfit),
      estimatedCapRate: validateNumber(analysisData.estimatedCapRate),
      suitableStrategies: Array.isArray(analysisData.suitableStrategies) ? analysisData.suitableStrategies : [],
      strategyRecommendations: Array.isArray(analysisData.strategyRecommendations) ? 
        analysisData.strategyRecommendations.map((rec: any) => ({
          strategy: rec.strategy || 'Unknown',
          score: validateNumber(rec.score, 5),
          reasoning: rec.reasoning || ''
        })) : [],
      marketTrends: analysisData.marketTrends || '',
      propertyPotential: analysisData.propertyPotential || '',
      renovationOpportunities: analysisData.renovationOpportunities || '',
      riskAssessment: analysisData.riskAssessment || '',
      estimatedRenovationCost: validateNumber(analysisData.estimatedRenovationCost),
      areaGrowthPotential: validateNumber(analysisData.areaGrowthPotential),
      areaInvestmentRating: validateNumber(analysisData.areaInvestmentRating, 5),
      areaDescription: analysisData.areaDescription || '',
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return generateMockAnalysis(property);
  }
};

// Generate mock investment analysis for testing or when API is unavailable
const generateMockAnalysis = (property: RightmoveProperty): PropertyInvestmentAnalysis => {
  console.log('Generating mock investment analysis for property:', property.id);
  
  // Ensure we have a valid property price (fallback to 250000 if invalid)
  const safePrice = typeof property.price === 'number' && !isNaN(property.price) && property.price > 0 
    ? property.price 
    : 250000;
  
  // Create a deterministic but varied hash based on property ID and price
  const propertyHash = property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + safePrice;
  
  // Use the hash to create varied but deterministic values
  const rand = (min: number, max: number) => {
    const value = (propertyHash % 1000) / 1000;
    return min + value * (max - min);
  };
  
  // Determine property value tier (affects yields and potential)
  const isHighEnd = safePrice > 500000;
  const isMidRange = safePrice > 250000 && safePrice <= 500000;
  const isLowEnd = safePrice <= 250000;
  
  // Base yield on property value and type
  let baseYield = isHighEnd ? rand(3.5, 5.5) : isMidRange ? rand(4.5, 6.5) : rand(5.5, 9);
  
  // Adjust yield for property type
  if (property.property_type?.toLowerCase().includes('flat')) {
    baseYield += rand(0.5, 1.5);
  } else if (property.property_type?.toLowerCase().includes('detached')) {
    baseYield -= rand(0.2, 0.8);
  }
  
  // Generate appropriate strategies based on property characteristics
  const strategies: string[] = [];
  
  // Most properties are suitable for Buy-to-Let
  strategies.push('Buy-to-Let');
  
  // HMO potential for larger properties with 3+ bedrooms
  if (property.bedrooms >= 3) {
    strategies.push('HMO');
  }
  
  // BRRR (Buy, Renovate, Rent, Refinance) for older properties
  if (!property.new_build) {
    strategies.push('BRRR');
  }
  
  // Serviced Accommodation for properties in tourist areas
  if (property.postcode && property.postcode.match(/^(BH|BS|B|BA|E|EC|W|WC|SW|NW|SE|N|M|L|EH|G|CF)/i)) {
    strategies.push('Serviced Accommodation');
  }
  
  // Flip potential for lower-priced properties
  if (isLowEnd) {
    strategies.push('Flip');
  }
  
  // Development potential for larger properties
  if (property.bedrooms >= 4 || (property.floor_area && property.floor_area.size > 1500)) {
    strategies.push('Development');
  }
  
  // Calculate other financial metrics based on the yield
  const monthlyRent = (safePrice * baseYield) / 100 / 12;
  const estimatedCashFlow = monthlyRent * 0.65; // Assuming 35% of rent goes to expenses
  const estimatedAnnualProfit = estimatedCashFlow * 12;
  
  // Generate strategy recommendations with scores
  const strategyRecommendations = strategies.map(strategy => {
    let score;
    let reasoning;
    
    switch (strategy) {
      case 'Buy-to-Let':
        score = isHighEnd ? rand(6, 8) : isMidRange ? rand(7, 9) : rand(6, 8);
        reasoning = `Good rental demand for ${property.property_type?.toLowerCase() || 'this type of property'} in this area. Estimated monthly rent of £${Math.round(monthlyRent)}.`;
        break;
      case 'HMO':
        score = property.bedrooms >= 4 ? rand(7, 9) : rand(5, 7);
        reasoning = `${property.bedrooms} bedrooms could generate £${Math.round(monthlyRent * 1.5)} as an HMO, but check local licensing requirements.`;
        break;
      case 'BRRR':
        score = !property.new_build ? rand(6, 8) : rand(2, 4);
        reasoning = property.new_build 
          ? 'Limited renovation potential as a new build property.' 
          : 'Good potential for value-add through modernization and reconfiguration.';
        break;
      case 'Serviced Accommodation':
        score = rand(5, 8);
        reasoning = `Could achieve 2-3x rental income as serviced accommodation if local regulations permit.`;
        break;
      case 'Flip':
        score = isLowEnd ? rand(6, 9) : rand(3, 6);
        reasoning = isLowEnd 
          ? 'Entry-level price point makes this suitable for a flip strategy with cosmetic improvements.' 
          : 'Higher price point limits margin potential for a flip strategy.';
        break;
      case 'Development':
        score = property.bedrooms >= 4 ? rand(6, 8) : rand(4, 6);
        reasoning = `Potential to add value through extension or conversion, subject to planning permission.`;
        break;
      default:
        score = rand(5, 7);
        reasoning = `Standard investment opportunity with moderate potential.`;
    }
    
    return {
      strategy,
      score: Math.round(score * 10) / 10, // Round to 1 decimal place
      reasoning
    };
  });

  // Sort strategies by score (descending)
  strategyRecommendations.sort((a, b) => b.score - a.score);
  
  // Calculate area growth potential based on postcode
  // Using first two characters of postcode for variance
  const postcodePrefix = property.postcode ? property.postcode.substring(0, 2).toUpperCase() : 'XX';
  const postcodeValue = postcodePrefix.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const areaGrowthPotential = 3 + (postcodeValue % 10) / 2; // Between 3% and 8%
  
  // Area investment rating
  const areaInvestmentRating = 5 + (postcodeValue % 10) / 2; // Between 5 and 10
  
  // Generate area description based on the postcode
  let areaDescription = '';
  
  if (['E', 'EC', 'W', 'WC', 'SW', 'NW', 'SE', 'N'].includes(postcodePrefix.substring(0, 1)) || 
      ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9'].includes(postcodePrefix.substring(0, 2))) {
    areaDescription = 'London area with strong rental demand and historically good capital appreciation.';
  } else if (['M', 'L', 'B', 'S', 'LS', 'NG'].includes(postcodePrefix.substring(0, 1)) || 
             ['M1', 'L1', 'B1', 'S1'].includes(postcodePrefix.substring(0, 2))) {
    areaDescription = 'Major city center location with good rental demand from young professionals and students.';
  } else if (['BN', 'BH', 'BS', 'BA', 'EX', 'PL', 'TR'].includes(postcodePrefix.substring(0, 2))) {
    areaDescription = 'Coastal or tourist area with potential for seasonal rental income and holiday lets.';
  } else {
    areaDescription = 'Residential area with stable property market and moderate growth potential.';
  }
  
  // Calculate estimated renovation costs
  const baseRenovationCost = property.new_build ? 0 : safePrice * 0.1;
  const sizeMultiplier = property.floor_area ? property.floor_area.size / 1000 : 1;
  const estimatedRenovationCost = baseRenovationCost * sizeMultiplier;
  
  // Log the generated mock data
  console.log('Generated mock investment analysis with properties:', {
    yield: baseYield,
    cashFlow: Math.round(estimatedCashFlow),
    topStrategy: strategyRecommendations[0]?.strategy
  });
  
  return {
    estimatedRentalYield: parseFloat(baseYield.toFixed(2)),
    estimatedROI: parseFloat((baseYield * 0.8).toFixed(2)), // ROI slightly lower than yield
    estimatedCashFlow: Math.round(estimatedCashFlow),
    estimatedAnnualProfit: Math.round(estimatedAnnualProfit),
    estimatedCapRate: parseFloat((baseYield * 0.9).toFixed(2)), // Cap rate slightly lower than yield
    suitableStrategies: strategies,
    strategyRecommendations,
    marketTrends: `The ${property.postcode?.split(' ')[0] || 'local'} area has seen ${areaGrowthPotential.toFixed(1)}% average price growth over the last year, ${areaGrowthPotential > 5 ? 'outperforming' : 'in line with'} the regional average.`,
    propertyPotential: `This ${property.bedrooms}-bedroom ${property.property_type?.toLowerCase() || 'property'} offers ${strategyRecommendations[0]?.score > 7 ? 'strong' : strategyRecommendations[0]?.score > 5 ? 'good' : 'moderate'} investment potential, particularly for ${strategyRecommendations[0]?.strategy || 'buy-to-let'} strategy.`,
    renovationOpportunities: property.new_build 
      ? 'As a new build, minimal renovation is required, but customization options may add value for specific tenant demographics.' 
      : `Potential improvements include modernizing the kitchen and bathroom, optimizing the layout, and energy efficiency upgrades to improve EPC rating and rental value.`,
    riskAssessment: `Main considerations include ${safePrice > 400000 ? 'higher stamp duty costs affecting initial yield, ' : ''}${property.property_type?.toLowerCase().includes('flat') ? 'service charge and ground rent costs, ' : ''}and potential market volatility affecting ${safePrice > 500000 ? 'higher-value properties' : safePrice > 250000 ? 'mid-range properties' : 'entry-level properties'} in this area.`,
    estimatedRenovationCost: Math.round(estimatedRenovationCost),
    areaGrowthPotential: parseFloat(areaGrowthPotential.toFixed(1)),
    areaInvestmentRating: parseFloat(areaInvestmentRating.toFixed(1)),
    areaDescription,
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