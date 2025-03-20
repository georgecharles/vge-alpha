import { supabase } from './supabase';

// Get the API key from environment variables with a fallback
const SCRAPER_API_KEY = import.meta.env.VITE_SCRAPER_API_KEY || '162910ce5fe80080edef0fe026506f0e';
const SCRAPER_API_URL = 'https://api.scraperapi.com/scrape';
const CACHE_TTL_HOURS = 12; // Cache duration in hours

// Add logging for ScraperAPI key to help with debugging
console.log('ScraperAPI key status:', SCRAPER_API_KEY ? (SCRAPER_API_KEY === '162910ce5fe80080edef0fe026506f0e' ? 'Using default key' : 'Using custom key') : 'No key');

// Type definitions
export interface RightmoveProperty {
  id: string;
  address: string;
  postcode: string;
  price: number;
  date_listed?: string;
  property_type: string;
  bedrooms: number;
  bathrooms?: number;
  description: string;
  image_urls: string[];
  main_image_url: string;
  agent: {
    name: string;
    phone?: string;
    logo_url?: string;
  };
  tenure?: string;
  new_build: boolean;
  floor_area?: {
    size: number;
    unit: string;
  };
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  rightmove_url: string;
  features?: string[];
}

export interface SearchFilters {
  location: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  propertyType?: string;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  properties: RightmoveProperty[];
  total: number;
  page: number;
  totalPages: number;
}

// Helper to check if a cached result is valid
const isCacheValid = (createdAt: string, ttlHours = CACHE_TTL_HOURS): boolean => {
  const cacheTime = new Date(createdAt).getTime();
  const currentTime = new Date().getTime();
  const ttlMillis = ttlHours * 60 * 60 * 1000;
  return currentTime - cacheTime < ttlMillis;
};

// Helper to create a DOMParser safely for both browser and Node environments
const createDOMParser = (html: string): Document => {
  // Create a DOM parser to parse the HTML string
  try {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  } catch (error) {
    console.error('Error creating DOMParser:', error);
    throw new Error('Failed to parse HTML: DOMParser not available');
  }
};

// Helper to extract property details from Rightmove HTML
const extractPropertyDetails = (html: string, url: string): RightmoveProperty | null => {
  try {
    const doc = createDOMParser(html);
    
    // Extract property ID from URL or meta tags
    const propertyId = url.match(/property-(\d+)/)?.[1] || '';
    
    // Extract address
    const addressElem = doc.querySelector('address.property-header-address');
    const address = addressElem ? addressElem.textContent?.trim() || '' : '';
    
    // Extract postcode - typically the last part of the address
    const postcodeMatch = address.match(/([A-Z]{1,2}[0-9][0-9A-Z]?)\s*([0-9][A-Z]{2})/i);
    const postcode = postcodeMatch ? postcodeMatch[0] : '';
    
    // Extract price
    const priceElem = doc.querySelector('.price-text');
    const priceText = priceElem ? priceElem.textContent || '' : '';
    const priceMatch = priceText.match(/[£$]?([\d,]+)/);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
    
    // Extract property type and bedrooms
    const propertyTypeElem = doc.querySelector('[data-testid="property-type"]');
    const propertyType = propertyTypeElem ? propertyTypeElem.textContent?.trim() || 'Unknown' : 'Unknown';
    
    // Extract number of bedrooms
    const bedroomsElem = doc.querySelector('[data-testid="beds"]');
    const bedroomsText = bedroomsElem ? bedroomsElem.textContent || '' : '';
    const bedrooms = bedroomsText ? parseInt(bedroomsText) : 0;
    
    // Extract bathrooms
    const bathroomsElem = doc.querySelector('[data-testid="baths"]');
    const bathroomsText = bathroomsElem ? bathroomsElem.textContent || '' : '';
    const bathrooms = bathroomsText ? parseInt(bathroomsText) : undefined;
    
    // Extract description
    const descriptionElem = doc.querySelector('.property-description');
    const description = descriptionElem ? descriptionElem.textContent?.trim() || '' : '';
    
    // Extract main image URL
    const mainImageMeta = doc.querySelector('meta[itemprop="image"]');
    const mainImageUrl = mainImageMeta ? mainImageMeta.getAttribute('content') || '' : '';
    
    // Extract all image URLs
    const imageUrls: string[] = [];
    const imageMetaTags = doc.querySelectorAll('meta[itemprop="contentUrl"]');
    imageMetaTags.forEach(tag => {
      const url = tag.getAttribute('content');
      if (url) imageUrls.push(url);
    });
    
    // If meta tags don't have images, try looking for image elements with data-src or src
    if (imageUrls.length === 0) {
      const imageElements = doc.querySelectorAll('.property-image img, .Gallery img');
      imageElements.forEach(img => {
        const url = img.getAttribute('data-src') || img.getAttribute('src');
        if (url && !imageUrls.includes(url)) {
          imageUrls.push(url);
        }
      });
    }
    
    // Extract agent info
    const agentNameElem = doc.querySelector('.agent-name');
    const agentName = agentNameElem ? agentNameElem.textContent?.trim() || 'Unknown Agent' : 'Unknown Agent';
    
    const agentPhoneElem = doc.querySelector('.agent-phone');
    const agentPhone = agentPhoneElem ? agentPhoneElem.textContent?.trim() : undefined;
    
    const agentLogoElem = doc.querySelector('.agent-logo img');
    const agentLogoUrl = agentLogoElem ? agentLogoElem.getAttribute('src') || undefined : undefined;
    
    // Extract new build status
    const newBuildElem = doc.querySelector('.new-home-flag');
    const isNewBuild = !!newBuildElem || /new build|newly built/i.test(propertyType);
    
    // Extract features
    const featureElems = doc.querySelectorAll('.property-features li');
    const features: string[] = [];
    featureElems.forEach(elem => {
      const feature = elem.textContent?.trim();
      if (feature) features.push(feature);
    });
    
    // Create property object
    const property: RightmoveProperty = {
      id: propertyId,
      address,
      postcode,
      price,
      property_type: propertyType,
      bedrooms,
      bathrooms,
      description,
      image_urls: imageUrls,
      main_image_url: mainImageUrl || (imageUrls.length > 0 ? imageUrls[0] : ''),
      agent: {
        name: agentName,
        phone: agentPhone,
        logo_url: agentLogoUrl
      },
      new_build: isNewBuild,
      is_active: true,
      rightmove_url: url,
      features
    };
    
    return property;
  } catch (error) {
    console.error('Error extracting property details:', error);
    return null;
  }
};

// Set up the scraper_cache table if it doesn't exist
export const ensureScraperCacheTableExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if scraper_cache table exists using simplified approach...');
    
    // Try the most direct approach first - can we count records in the table?
    const { data: countData, error: countError } = await supabase
      .from('scraper_cache')
      .select('*', { count: 'exact', head: true });
      
    // If we can get a count without error, the table exists
    if (!countError) {
      console.log('✅ scraper_cache table exists - count check successful');
      return true;
    }
    
    console.log('Count check failed:', countError);
    
    // Try to insert a test record as a fallback check
    const testKey = `test-existence-${Date.now()}`;
    const { error: insertError } = await supabase
      .from('scraper_cache')
      .insert({ 
        key: testKey, 
        data: { test: true },
        created_at: new Date().toISOString()
      });
      
    if (!insertError) {
      console.log('✅ Successfully verified scraper_cache table exists via insert test!');
      return true;
    }
    
    console.error('Insert test failed:', insertError);
    console.error('The scraper_cache table does not appear to be accessible');
    
    // Table doesn't exist or isn't accessible, so return false
    return false;
  } catch (error) {
    console.error('Error in ensureScraperCacheTableExists:', error);
    return false;
  }
};

// Function to test the ScraperAPI key
const testScraperAPIKey = async (): Promise<{ success: boolean; message: string }> => {
  console.log('ScraperAPI validation skipped - application now uses Apify exclusively');
  return { success: true, message: 'ScraperAPI validation skipped - application now uses Apify exclusively' };
};

// Validate ScraperAPI key
const validateScraperAPIKey = async (): Promise<boolean> => {
  console.log('ScraperAPI validation skipped - application now uses Apify exclusively');
  return true;
};

// Helper function to check if we're using the default API key
export const isUsingDefaultAPIKey = (): boolean => {
  return SCRAPER_API_KEY === '162910ce5fe80080edef0fe026506f0e';
};

// Initialize the scraper on import
(() => {
  console.log('Initializing Rightmove scraper... (using Apify exclusively)');
  
  // Skip ScraperAPI validation since we're using Apify exclusively
  console.log('✅ ScraperAPI validation skipped - application now uses Apify exclusively');
  
  // Ensure the cache table exists (don't await - let it run in background)
  ensureScraperCacheTableExists().then(exists => {
    if (!exists) {
      console.warn('Scraper cache table does not exist. This may affect performance.');
    }
  });
})();

// Get a cached result or fetch fresh data
const getCachedOrFresh = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlHours = CACHE_TTL_HOURS
): Promise<T> => {
  try {
    // Ensure the cache table exists
    const tableExists = await ensureScraperCacheTableExists();
    if (!tableExists) {
      console.warn('Cache table does not exist, fetching fresh data');
      return await fetchFn();
    }
    
    // Check cache first
    const { data: cachedResult, error: cacheError } = await supabase
      .from('scraper_cache')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (cacheError) {
      console.error('Error checking cache:', cacheError);
      return await fetchFn();
    }

    if (cachedResult && isCacheValid(cachedResult.created_at, ttlHours)) {
      console.log(`Using cached data for ${key}`);
      return cachedResult.data as T;
    }

    // If not in cache or expired, fetch fresh data
    console.log(`Fetching fresh data for ${key}`);
    const freshData = await fetchFn();

    // Store in cache
    const { error } = await supabase
      .from('scraper_cache')
      .upsert(
        { 
          key, 
          data: freshData,
          created_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Error storing data in cache:', error);
    }

    return freshData;
  } catch (error) {
    console.error('Error in getCachedOrFresh:', error);
    // If cache fails, try to fetch fresh data anyway
    return await fetchFn();
  }
};

// Mock data function for testing or when the API is unavailable
const getMockPropertyData = (filters: SearchFilters): SearchResponse => {
  console.error('⚠️ USING MOCK PROPERTY DATA - NOT REAL RIGHTMOVE DATA ⚠️');
  console.error('This is happening because of an error or the scraper_cache table is not set up correctly');
  
  const mockProperties: RightmoveProperty[] = Array(12).fill(0).map((_, index) => ({
    id: `mock-${index}`,
    address: `📌 MOCK DATA: ${index + 1} Mock Street, ${filters.location || 'London'}`,
    postcode: 'SW1A 1AA',
    price: 250000 + (index * 50000),
    property_type: ['Flat', 'Terraced', 'Semi-Detached', 'Detached'][index % 4],
    bedrooms: 1 + (index % 5),
    bathrooms: 1 + (index % 3),
    description: `⚠️ MOCK DATA: This is not real Rightmove data. This is a placeholder ${index + 1} bedroom property in ${filters.location || 'London'} with modern amenities.`,
    image_urls: [`https://placehold.co/800x600?text=MOCK+${index + 1}`],
    main_image_url: `https://placehold.co/800x600?text=MOCK+${index + 1}`,
    agent: {
      name: 'Mock Estate Agents (Not Real)',
      phone: '01234 567890',
      logo_url: 'https://placehold.co/200x100?text=Mock+Agent'
    },
    new_build: index % 3 === 0,
    is_active: true,
    rightmove_url: `https://www.rightmove.co.uk/properties/mock-${index}`,
    features: ['Mock Garden', 'Mock Parking', 'Mock Double Glazing', 'Mock Central Heating']
  }));
  
  return {
    properties: mockProperties,
    total: 48,
    page: filters.page || 1,
    totalPages: 4
  };
};

// Function to provide a direct fetch fallback if ScraperAPI fails
const directFetch = async (url: string): Promise<string> => {
  console.log('Attempting direct fetch as fallback...');
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Direct fetch failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Direct fetch fallback failed:', error);
    throw error;
  }
};

// Main scraper function for Rightmove search
export const searchRightmoveProperties = async (filters: SearchFilters): Promise<SearchResponse> => {
  const { location, minPrice, maxPrice, minBeds, maxBeds, propertyType, radius = 1, page = 1 } = filters;
  
  // Validate location
  if (!location) {
    throw new Error('Location is required for property search');
  }
  
  // Clean location input - remove any cache-busting parameters
  const cleanLocation = location.replace(/\?_bypass_cache=\d+/, '');
  
  // Construct cache key based on search parameters
  const cacheKey = `rightmove:search:${cleanLocation}:${minPrice || ''}:${maxPrice || ''}:${minBeds || ''}:${maxBeds || ''}:${propertyType || ''}:${radius}:${page}`;
  
  return getCachedOrFresh(
    cacheKey,
    async () => {
      try {
        // Log the environment variables for debugging
        console.log('ENV VITE_USE_MOCK_DATA [raw]:', import.meta.env.VITE_USE_MOCK_DATA);
        
        // COMPLETELY DISABLE MOCK DATA FOR TESTING
        // =======================================
        // Even if VITE_USE_MOCK_DATA is true, we won't use mock data to verify our API works
        console.log('TESTING MODE: MOCK DATA COMPLETELY DISABLED REGARDLESS OF ENVIRONMENT SETTINGS');

        // Validate API key before making requests
        if (isUsingDefaultAPIKey()) {
          throw new Error(
            'Default ScraperAPI key detected. This key is not valid. Please get your own key at www.scraperapi.com and set it in .env.local'
          );
        }

        // Test the ScraperAPI key to provide better error messages
        const apiKeyTest = await testScraperAPIKey();
        if (!apiKeyTest.success) {
          throw new Error(`ScraperAPI key validation failed: ${apiKeyTest.message}`);
        }
        
        // We'll try multiple URL formats in sequence until one works
        // Format 1: The most reliable format - using keywords in the simplest form
        const simpleSearchUrl = `https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&keywords=${encodeURIComponent(cleanLocation)}`;
        
        // Format 2: With more parameters
        const detailedSearchUrl = `https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&keywords=${encodeURIComponent(cleanLocation)}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}${minBeds ? `&minBedrooms=${minBeds}` : ''}${maxBeds ? `&maxBedrooms=${maxBeds}` : ''}${propertyType ? `&propertyTypes=${propertyType}` : ''}&radius=${radius}&includeSSTC=false&page=${page}`;

        // Format 3: Using locationIdentifier format (less reliable)
        const locationSearchUrl = `https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=REGION%5E${encodeURIComponent(cleanLocation)}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}${minBeds ? `&minBedrooms=${minBeds}` : ''}${maxBeds ? `&maxBedrooms=${maxBeds}` : ''}${propertyType ? `&propertyTypes=${propertyType}` : ''}&radius=${radius}&includeSSTC=false&page=${page}`;
        
        console.log('Trying three search URL formats:');
        console.log('Format 1 (Simple):', simpleSearchUrl);
        console.log('Format 2 (Detailed):', detailedSearchUrl);
        console.log('Format 3 (Location ID):', locationSearchUrl);
        
        // Start with the most reliable URL format
        let urlToUse = simpleSearchUrl;
        
        // Additional parameters for ScraperAPI to improve reliability
        const scraperParams = {
          api_key: SCRAPER_API_KEY,
          url: encodeURIComponent(urlToUse),
          render: 'true',
          country_code: 'uk',
          keep_headers: 'true',
          premium: 'true' // Use premium proxies for better success rate
        };
        
        // Build the ScraperAPI URL with parameters
        const scraperApiUrl = `${SCRAPER_API_URL}?${Object.entries(scraperParams)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')}`;
        
        console.log('Making request to ScraperAPI...');
        
        // Try each URL format in sequence until one works
        let html = '';
        let response = null;
        let success = false;
        let attemptCount = 0;
        let lastError = null;
        const urlFormats = [simpleSearchUrl, detailedSearchUrl, locationSearchUrl];
        
        while (!success && attemptCount < urlFormats.length) {
          try {
            const currentUrl = urlFormats[attemptCount];
            console.log(`Attempt ${attemptCount + 1}: Trying URL: ${currentUrl}`);
            
            // Update the URL in the params
            scraperParams.url = encodeURIComponent(currentUrl);
            
            // Rebuild the ScraperAPI URL with new search URL
            const currentScraperUrl = `${SCRAPER_API_URL}?${Object.entries(scraperParams)
              .map(([key, value]) => `${key}=${value}`)
              .join('&')}`;
            
            response = await fetch(currentScraperUrl);
            
            if (!response.ok) {
              // Check for API key related errors specifically
              if (response.status === 401 || response.status === 403 || response.status === 404) {
                throw new Error(`ScraperAPI key error: ${response.status} ${response.statusText}. Please get a valid API key from www.scraperapi.com`);
              }
              
              throw new Error(`Failed with status: ${response.status} ${response.statusText}`);
            }
            
            html = await response.text();
            
            // Check if we got a meaningful response
            if (html.length < 1000) {
              throw new Error('Received too short response');
            }
            
            // Check if there are property cards in the response
            const doc = createDOMParser(html);
            const propertyCards = doc.querySelectorAll('.propertyCard, .l-searchResult');
            
            if (propertyCards.length === 0) {
              throw new Error('No property cards found');
            }
            
            // If we got here, the request was successful
            success = true;
            console.log(`Success with URL format ${attemptCount + 1}!`);
            
          } catch (error) {
            console.error(`Attempt ${attemptCount + 1} failed:`, error);
            lastError = error;
            attemptCount++;
            
            // If this is an API key error, fail immediately
            if (error instanceof Error && 
                (error.message.includes('ScraperAPI key error') || 
                 error.message.includes('API key validation failed'))) {
              break;
            }
            
            // If this was the last attempt, rethrow the error
            if (attemptCount >= urlFormats.length) {
              throw new Error(`All URL formats failed. Last error: ${error.message}`);
            }
          }
        }
        
        if (!success) {
          if (lastError && lastError.message.includes('API key')) {
            throw lastError;
          }
          throw new Error('All URL formats failed to return valid results');
        }
        
        // We now have a successful response in 'html'
        console.log('Received HTML response of length:', html.length);
        
        // Parse HTML to extract property listings
        const doc = createDOMParser(html);
        
        // Find all property cards/results
        const propertyCards = doc.querySelectorAll('.propertyCard, .l-searchResult');
        console.log('Found property cards:', propertyCards.length);
        
        // Extract properties
        const properties: RightmoveProperty[] = [];
        
        propertyCards.forEach((card, index) => {
          try {
            // Extract property details from the card
            const propertyLinkElem = card.querySelector('.propertyCard-link, .propertyCard-img-link, a[data-test="property-details"]');
            const propertyUrl = propertyLinkElem?.getAttribute('href') || '';
            const fullPropertyUrl = propertyUrl.startsWith('http') ? propertyUrl : `https://www.rightmove.co.uk${propertyUrl}`;
            
            // Extract property ID from URL
            const propertyIdMatch = fullPropertyUrl.match(/property-(\d+)/);
            const propertyId = propertyIdMatch ? propertyIdMatch[1] : `rm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
            // Extract address
            const addressElem = card.querySelector('.propertyCard-address, .propertyCard-title, [data-test="address-title"]');
            const address = addressElem ? addressElem.textContent?.trim() || '' : '';
            
            // Extract postcode - typically the last part of the address
            const postcodeMatch = address.match(/([A-Z]{1,2}[0-9][0-9A-Z]?)\s*([0-9][A-Z]{2})/i);
            const postcode = postcodeMatch ? postcodeMatch[0] : '';
            
            // Extract price
            const priceElem = card.querySelector('.propertyCard-priceValue, .propertyCard-price, [data-test="property-price"]');
            const priceText = priceElem ? priceElem.textContent || '' : '';
            const priceMatch = priceText.match(/[£$]?([\d,]+)/);
            const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
            
            // Extract property type and bedrooms
            const infoElem = card.querySelector('.propertyCard-details, .propertyCard-description, [data-test="property-description"]');
            const infoText = infoElem ? infoElem.textContent || '' : '';
            
            // Try to extract property type
            let propertyType = 'Unknown';
            const typeMatches = [
              /\b(flat|apartment)\b/i,
              /\b(terraced|terrace)\b/i,
              /\b(semi-detached|semi detached)\b/i,
              /\b(detached)\b/i,
              /\b(bungalow)\b/i,
              /\b(house)\b/i
            ];
            
            for (const pattern of typeMatches) {
              const match = infoText.match(pattern);
              if (match) {
                propertyType = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                break;
              }
            }
            
            // Extract bedrooms
            const bedroomsMatch = infoText.match(/(\d+)\s*bed/i);
            const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : 1;
            
            // Extract bathrooms
            const bathroomsMatch = infoText.match(/(\d+)\s*bath/i);
            const bathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : undefined;
            
            // Extract main image
            const imgElem = card.querySelector('.propertyCard-img img, .propertyCard-image img, [data-test="property-image"] img');
            const imgSrc = imgElem?.getAttribute('src') || imgElem?.getAttribute('data-src') || '';
            
            // Extract agent info
            const agentElem = card.querySelector('.propertyCard-branchLogo img, .propertyCard-agent img, [data-test="agent-logo"] img');
            const agentName = agentElem?.getAttribute('alt') || 'Unknown';
            const agentLogoUrl = agentElem?.getAttribute('src') || undefined;
            
            // Check for new build
            const isNewBuild = card.textContent?.includes('New build') || card.textContent?.includes('New home') || false;
            
            // Create property object
            const property: RightmoveProperty = {
              id: propertyId,
              address,
              postcode,
              price,
              property_type: propertyType,
              bedrooms,
              bathrooms,
              description: infoText.trim(),
              image_urls: imgSrc ? [imgSrc] : [],
              main_image_url: imgSrc,
              agent: {
                name: agentName,
                logo_url: agentLogoUrl
              },
              new_build: isNewBuild,
              is_active: true,
              rightmove_url: fullPropertyUrl
            };
            
            properties.push(property);
          } catch (err) {
            console.error(`Error parsing property card ${index}:`, err);
          }
        });
        
        // Extract pagination info
        const paginationText = doc.querySelector('.searchHeader-resultCount, [data-test="total-results"]')?.textContent || '';
        const totalMatch = paginationText.match(/of\s+(\d+)|(\d+)\s+results/i);
        const total = totalMatch ? parseInt(totalMatch[1] || totalMatch[2]) : properties.length;
        const totalPages = Math.ceil(total / 24); // Rightmove shows 24 properties per page
        
        return {
          properties,
          total,
          page,
          totalPages
        };
      } catch (error) {
        console.error('Error in searchRightmoveProperties:', error);
        
        // COMPLETELY DISABLE MOCK DATA EVEN IN ERROR CASES
        // Forward the error to be handled by the caller
        throw error;
      }
    }
  );
};

// Get detailed property data from a Rightmove property URL
export const getPropertyDetails = async (propertyId: string): Promise<RightmoveProperty | null> => {
  if (!propertyId) {
    throw new Error('Property ID is required');
  }
  
  const cacheKey = `rightmove:property:${propertyId}`;
  
  return getCachedOrFresh(
    cacheKey,
    async () => {
      try {
        // If it has "mock-" prefix, it's a mock property ID
        if (propertyId.startsWith('mock-') && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
          console.log('Mock property ID detected, using mock property details');
          return {
            id: propertyId,
            address: '123 Mock Street, London',
            postcode: 'SW1A 1AA',
            price: 500000,
            property_type: 'Detached',
            bedrooms: 3,
            bathrooms: 2,
            description: 'A beautiful mock property for testing',
            image_urls: ['https://via.placeholder.com/800x600.png?text=Property'],
            main_image_url: 'https://via.placeholder.com/800x600.png?text=Property',
            agent: {
              name: 'Mock Estate Agents',
              phone: '01234 567890',
              logo_url: 'https://via.placeholder.com/200x100.png?text=Agent+Logo'
            },
            new_build: false,
            is_active: true,
            rightmove_url: `https://www.rightmove.co.uk/properties/${propertyId}`,
            features: ['Garden', 'Parking', 'Double Glazing', 'Central Heating']
          };
        }
        
        // Format with and without the trailing slash - Rightmove accepts both
        const rightmoveUrl = `https://www.rightmove.co.uk/properties/${propertyId}`;
        
        // Additional parameters for ScraperAPI to improve reliability
        const scraperParams = {
          api_key: SCRAPER_API_KEY,
          url: encodeURIComponent(rightmoveUrl),
          render: 'true',
          country_code: 'uk',
          keep_headers: 'true',
          premium: 'true' // Use premium proxies for better success rate
        };
        
        // Build the ScraperAPI URL with parameters
        const scraperApiUrl = `${SCRAPER_API_URL}?${Object.entries(scraperParams)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')}`;
        
        console.log('Fetching property details from:', rightmoveUrl);
        console.log('ScraperAPI URL:', scraperApiUrl);
        
        const response = await fetch(scraperApiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch property details: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log('Received property details HTML of length:', html.length);
        
        if (html.length < 1000) {
          console.warn('Suspiciously short property details HTML received');
          console.log('HTML content preview:', html.substring(0, 500));
          
          if (html.includes('rate limit') || html.includes('too many requests')) {
            throw new Error('Rate limited by ScraperAPI. Please try again later.');
          }
        }
        
        const property = extractPropertyDetails(html, rightmoveUrl);
        
        if (!property) {
          throw new Error('Failed to extract property details from HTML');
        }
        
        return property;
      } catch (error) {
        console.error('Error in getPropertyDetails:', error);
        
        // Don't use mock data in error cases - let the error propagate
        throw error;
      }
    }
  );
};

// Check if a property is still active on Rightmove
export const checkPropertyActiveStatus = async (propertyId: string): Promise<boolean> => {
  try {
    // Only use mock mode if explicitly enabled
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      console.log('Using mock active status because VITE_USE_MOCK_DATA=true');
      return true; // Always return active in mock mode
    }
    
    const rightmoveUrl = `https://www.rightmove.co.uk/properties/${propertyId}`;
    const scraperApiUrl = `${SCRAPER_API_URL}?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(rightmoveUrl)}&render=true`;
    
    const response = await fetch(scraperApiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch property status: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Property is inactive if the page contains certain text
    const isInactive = html.includes('This property has been removed by the agent') || 
                      html.includes('This property is no longer available') ||
                      html.includes('has now been sold subject to contract');
    
    // Update the cache if the property is inactive
    if (isInactive) {
      try {
        // Update property cache entry directly
        await supabase.rpc('mark_property_inactive', { property_id: propertyId });
        console.log(`Marked property ${propertyId} as inactive`);
      } catch (err) {
        console.error('Failed to update property active status in cache:', err);
      }
    }
    
    return !isInactive;
  } catch (error) {
    console.error('Error checking property active status:', error);
    // Don't assume inactive, throw the error to be handled by the caller
    throw error;
  }
};

// Purge expired cache entries
export const purgeExpiredCache = async (): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('purge_expired_cache');
    
    if (error) {
      throw error;
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error purging expired cache:', error);
    return 0;
  }
}; 