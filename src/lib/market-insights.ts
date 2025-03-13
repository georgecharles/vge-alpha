import { supabase } from "./supabaseClient";

// Define the SQL constant directly in this file instead of re-exporting it
export const CREATE_MARKET_INSIGHTS_TABLE_SQL = `
-- Function to create the market_insights table
CREATE OR REPLACE FUNCTION create_market_insights_table()
RETURNS VOID AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'market_insights'
  ) THEN
    -- Create the table
    CREATE TABLE public.market_insights (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      content TEXT NOT NULL,
      generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Add appropriate indexes
    CREATE INDEX market_insights_generated_at_idx ON public.market_insights (generated_at);
    
    -- Set up RLS (Row Level Security)
    ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Allow anonymous read access" 
      ON public.market_insights FOR SELECT 
      USING (true);
      
    CREATE POLICY "Allow authenticated insert" 
      ON public.market_insights FOR INSERT 
      TO authenticated 
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if the user has admin privileges
CREATE OR REPLACE FUNCTION check_admin_privileges()
RETURNS BOOLEAN AS $$
BEGIN
  -- Try to create a temporary table as a privilege check
  BEGIN
    CREATE TEMPORARY TABLE privilege_check (id INT);
    DROP TABLE privilege_check;
    RETURN TRUE;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql;
`;

// Mock data for when API calls fail
const MOCK_NEWS = [
  {
    title: "UK House Prices Show Resilience Despite Economic Pressures",
    source: "Property News UK",
    published_at: new Date().toISOString(),
    url: "#",
    excerpt: "The latest data shows UK house prices maintaining stability with regional variations in growth rates."
  },
  {
    title: "New Rental Reforms Set to Transform Landlord-Tenant Relationships",
    source: "Real Estate Times",
    published_at: new Date(Date.now() - 86400000).toISOString(),
    url: "#",
    excerpt: "The government's proposed rental reforms aim to provide greater security for tenants while maintaining landlord rights."
  },
  {
    title: "Property Investment Shifts: Where Buyers Are Looking in 2024",
    source: "Investment Quarterly",
    published_at: new Date(Date.now() - 172800000).toISOString(),
    url: "#",
    excerpt: "Investor focus is moving toward emerging regional hotspots as work patterns continue to evolve post-pandemic."
  },
  {
    title: "Interest Rate Forecast and Impact on Mortgage Market",
    source: "Financial Property Review",
    published_at: new Date(Date.now() - 259200000).toISOString(),
    url: "#",
    excerpt: "Analysts predict stabilizing interest rates may provide relief for mortgage holders in the coming quarters."
  },
  {
    title: "Green Homes Grant: What Property Owners Need to Know",
    source: "Sustainable Housing",
    published_at: new Date(Date.now() - 345600000).toISOString(),
    url: "#",
    excerpt: "The latest initiatives for improving energy efficiency in UK homes and the financial incentives available."
  }
];

const MOCK_MARKET_INSIGHTS = `
# UK Property Market Insights: July 2024

## Latest Tax Law Changes

The UK property market continues to adapt to recent regulatory changes. In April 2024, the government implemented adjustments to Capital Gains Tax (CGT) rates for property investors, with the higher rate increasing from 28% to 30% for residential property disposals. Buy-to-let landlords face additional reporting requirements for rental income above £10,000 annually.

The Stamp Duty Land Tax (SDLT) thresholds remain unchanged from last year's autumn statement, with first-time buyers enjoying relief up to £425,000 (down from £625,000 in 2023).

## Landlord Regulations

Licensing requirements have expanded to include mandatory electrical safety certificates (EICR) renewals every five years, and the new Decent Homes Standard now applies to the private rental sector. Tenant rights have strengthened with the Renters Reform Bill provisions now in effect, limiting no-fault evictions and establishing stronger grounds for possession.

Property safety regulations now include stricter rules for carbon monoxide alarms, with mandatory installation in all rooms with fixed combustion appliances.

## Government Policies

The Housing Ministry has announced a target of 300,000 new homes annually by 2026, with planning reforms to streamline development in designated growth zones. The Help to Buy equity loan scheme has been replaced with the First Homes initiative, offering 30-50% discounts on market value for first-time buyers.

Regional variations exist in Scotland's Private Housing (Tenancies) Act and Wales' Renting Homes Act, creating a patchwork regulatory landscape.

## Market Impact Analysis

These regulatory changes are creating downward pressure on rental yields, with the average UK yield dropping from 5.8% to 5.2% over the past year. Property values in commuter belts have shown greater resilience (+3.2%) compared to city centers (+1.7%).

Investment strategy adjustments should focus on regions with strong infrastructure investment and employment growth, particularly the Midlands and Northern England which offer better yields despite regulatory pressures.
`;

const MOCK_RISK_ASSESSMENT = `
# Market Risk Assessment: UK Property Sector

## Current Risk Level: Moderate

### Interest Rate Risk
The Bank of England's current base rate of 4.25% represents a stabilization after the peak of 5.25% in late 2023. While further cuts are anticipated, they are expected to be gradual, maintaining moderate pressure on mortgage affordability.

### Regulatory Risk
The implementation phase of the Renters Reform Bill creates temporary uncertainty for landlords adapting to new requirements. Compliance costs have increased approximately 12% year-over-year.

### Market Liquidity Risk
Transaction volumes remain 15% below pre-pandemic levels, extending the average time to sell from 45 to 63 days. Regional variations are significant, with London experiencing greater liquidity constraints than the North East.

### Recommendation
Investors should focus on properties with strong fundamentals that can weather short-term market fluctuations, particularly those in areas with diverse economic bases and strong rental demand.
`;

const MOCK_PERSONALIZED_OPPORTUNITIES = [
  {
    area: "Manchester - Salford Quays",
    propertyType: "2-bedroom apartments",
    averagePrice: 210000,
    expectedYield: 5.8,
    growthPotential: "High",
    keyFactors: [
      "Tech industry expansion",
      "Transport improvements",
      "Regeneration projects"
    ]
  },
  {
    area: "Birmingham - Jewellery Quarter",
    propertyType: "1-2 bedroom converted industrial",
    averagePrice: 185000,
    expectedYield: 5.4,
    growthPotential: "Medium-High",
    keyFactors: [
      "HS2 development impact",
      "Growing young professional population",
      "Cultural district revival"
    ]
  },
  {
    area: "Leeds - South Bank",
    propertyType: "New build city apartments",
    averagePrice: 195000,
    expectedYield: 5.9,
    growthPotential: "High",
    keyFactors: [
      "Major regeneration area",
      "Financial sector growth",
      "University expansion"
    ]
  }
];

// Check if the market_insights table exists, create it if it doesn't
async function ensureMarketInsightsTable() {
  try {
    // First check if the table exists
    const { error: checkError } = await supabase
      .from('market_insights')
      .select('id')
      .limit(1);
    
    // If the table doesn't exist, we'll get a specific error
    if (checkError && checkError.code === '42P01') {
      console.log('Market insights table does not exist, attempting to create it...');
      
      // Using SQL to create the table - note this requires higher privileges,
      // so it might not work with the client's credentials
      const { error: createError } = await supabase.rpc('create_market_insights_table');
      
      if (createError) {
        console.error('Failed to create market_insights table:', createError);
        return false;
      }
      
      console.log('Market insights table created successfully');
      return true;
    }
    
    // Table exists
    return true;
  } catch (error) {
    console.error('Error checking/creating market_insights table:', error);
    return false;
  }
}

// Modified to use mock data when API fails
export async function fetchPropertyNews() {
  try {
    // Try to fetch from real API
    const response = await fetch(
      "https://newsapi.org/v2/everything?q=uk+property+market&sortBy=publishedAt&apiKey=YOUR_API_KEY&pageSize=10"
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.articles && data.articles.length > 0) {
      return data.articles.map((article: any) => ({
        title: article.title,
        source: article.source.name,
        published_at: article.publishedAt,
        url: article.url,
        excerpt: article.description
      }));
    }
    
    // Fallback to mock data if no articles
    console.log('No articles found in API response, using mock data');
    return MOCK_NEWS;
  } catch (error) {
    console.error("Error fetching property news:", error);
    // Return mock data on error
    return MOCK_NEWS;
  }
}

// Modified to use mock data when API fails
export async function generateMarketInsights(prompt: string) {
  try {
    // Check if the API key is valid
    const apiKey = "AIzaSyD0MjDEtw7El7GSzOm9F8iIKE2uGDkVBWo";
    if (!apiKey || apiKey.includes("YOUR_API_KEY")) {
      console.warn("Using mock data: No valid API key provided for Gemini");
      return MOCK_MARKET_INSIGHTS;
    }
    
    // Try to use the real API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
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
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text from the response, handling different response structures
    let generatedText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const textParts = data.candidates[0].content.parts.filter(
        (part: any) => part.text
      );
      generatedText = textParts.map((part: any) => part.text).join("\n");
    } else if (data.text) {
      generatedText = data.text;
    }

    if (!generatedText) {
      console.warn("Empty response from Gemini API, using mock data");
      return MOCK_MARKET_INSIGHTS;
    }

    return generatedText;
  } catch (error) {
    console.error("Error generating insights:", error);
    // Return mock data on error
    return MOCK_MARKET_INSIGHTS;
  }
}

export async function formatMessage(text: string) {
  // Simple markdown-to-html conversion for basic formatting
  if (!text) return "<p>No data available</p>";
  
  return text
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-5">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
    .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gm, '<em>$1</em>')
    .replace(/\n- (.*)/gm, '\n<li>$1</li>')
    .replace(/<\/li>\n<li>/gm, '</li><li>')
    .replace(/\n<li>/gm, '\n<ul class="list-disc pl-5 mb-4"><li>')
    .replace(/<\/li>\n\n/gm, '</li></ul>\n\n')
    .replace(/<\/li>\n([^<])/gm, '</li></ul>\n$1')
    .replace(/\n\n/gm, '</p><p class="mb-4">')
    .replace(/^(.+)$/gm, '<p class="mb-4">$1</p>')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h.*?><\/p>/g, '</h>');
}

export async function getLatestMarketInsights() {
  try {
    await ensureMarketInsightsTable();
    
    const { data, error } = await supabase
      .from("market_insights")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching market insights:", error);
      // Return a mock response instead of throwing
      return {
        id: "mock-id",
        content: MOCK_MARKET_INSIGHTS,
        generated_at: new Date().toISOString(),
      };
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error in getLatestMarketInsights:", error);
    // Return a mock response on error
    return {
      id: "mock-id",
      content: MOCK_MARKET_INSIGHTS,
      generated_at: new Date().toISOString(),
    };
  }
}

export async function storeMarketInsights(content: string) {
  try {
    await ensureMarketInsightsTable();
    
    const { data, error } = await supabase
      .from("market_insights")
      .insert([
        {
          content,
          generated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error storing market insights:", error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error in storeMarketInsights:", error);
    return null;
  }
}

export async function getRiskAssessment() {
  try {
    // This could be fetched from an API or database in the future
    return MOCK_RISK_ASSESSMENT;
  } catch (error) {
    console.error("Error fetching risk assessment:", error);
    return MOCK_RISK_ASSESSMENT;
  }
}

export async function getPersonalizedOpportunities() {
  try {
    // This could be fetched from an API or database in the future
    return MOCK_PERSONALIZED_OPPORTUNITIES;
  } catch (error) {
    console.error("Error fetching personalized opportunities:", error);
    return MOCK_PERSONALIZED_OPPORTUNITIES;
  }
}

export async function getPredictiveAnalytics(region = "UK") {
  try {
    // This would connect to a real predictive API in the future
    return {
      region: region,
      currentAveragePrice: 290000,
      predictedGrowthRate: 3.8,
      confidenceScore: 82,
      timeframe: "12 months",
      factors: [
        "Interest rate stabilization",
        "Housing supply constraints",
        "Regional economic development"
      ]
    };
  } catch (error) {
    console.error("Error fetching predictive analytics:", error);
    return {
      region: region,
      currentAveragePrice: 290000,
      predictedGrowthRate: 3.2,
      confidenceScore: 75,
      timeframe: "12 months",
      factors: [
        "Mock data - API unavailable",
        "Contact administrator for actual predictions"
      ]
    };
  }
}
