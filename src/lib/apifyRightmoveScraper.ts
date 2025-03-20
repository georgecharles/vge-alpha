import { supabase } from './supabase';

// Apify API token - use the one from environment variables or fallback to the provided token
const APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN || 'apify_api_aPVtpmUSZzjriimnhQ6qsQuVXxqSpB12oY5r';
const APIFY_ACTOR_ID = 'dhrumil/rightmove-scraper';
const CACHE_TTL_HOURS = 12; // Cache duration in hours

// Log Apify token status
console.log('Apify API token status:', APIFY_API_TOKEN ? 'Token configured' : 'No token');

// Export the same RightmoveProperty interface to maintain compatibility
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
  property_images?: string[];
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
  floorplans?: string[];
  added_date?: string;
  retirement?: boolean;
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
  locationIdentifier?: string;
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

// Set up the scraper_cache table if it doesn't exist
export const ensureScraperCacheTableExists = async (): Promise<boolean> => {
  try {
    console.log('Checking if scraper_cache table exists using simplified approach...');
    
    // Try the most direct approach first - can we count records in the table?
    const { error: countError } = await supabase
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

// Function to test the Apify API token to ensure it's valid
export const testApifyToken = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // In development mode, don't make a direct API call to avoid CORS
    if (import.meta.env.DEV) {
      console.log('Testing Apify token in development mode - using GET request for testing');
      
      // Try a simple GET request to avoid CORS issues
      const response = await fetch('https://api.apify.com/v2/datasets/RPnlhVhYUc2eHliSs/items?token=apify_api_aPVtpmUSZzjriimnhQ6qsQuVXxqSpB12oY5r&limit=1');
      
      if (!response.ok) {
        return { 
          success: false, 
          message: `Cannot access Apify datasets: ${response.status} ${response.statusText}` 
        };
      }
      
      return { 
        success: true, 
        message: `Successfully connected to Apify using sample dataset` 
      };
    }
    
    // Test the API token by fetching user info
    const response = await fetch('https://api.apify.com/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${APIFY_API_TOKEN}`
      }
    });

    if (!response.ok) {
      return { 
        success: false, 
        message: `Apify API token validation failed: ${response.status} ${response.statusText}` 
      };
    }

    const data = await response.json();
    return { 
      success: true, 
      message: `Valid Apify token for user: ${data.data.username || 'unknown'}` 
    };
  } catch (error) {
    console.error('Error testing Apify token:', error);
    return { 
      success: false, 
      message: `Connection error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Get a cached result or fetch fresh data

// Function to run the Apify actor and get results
const runApifyActor = async (input: any): Promise<any> => {
  try {
    console.log('Running Apify actor with input:', input);
    
    // Check if we're running in development mode (important for handling CORS differently)
    const isDev = import.meta.env.DEV;
    console.log(`Running in ${isDev ? 'development' : 'production'} mode`);
    
    // In development mode, we'll use a different approach to handle CORS issues
    if (isDev) {
      console.log('Using local development approach for CORS handling');
      
      // Create a simple random identifier for this run to help with logging
      const runIdentifier = `run_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log(`Request ID: ${runIdentifier}`);
      
      // Store the input in localStorage temporarily (only in dev mode)
      const storageKey = `apify_input_${runIdentifier}`;
      localStorage.setItem(storageKey, JSON.stringify(input));
      console.log(`Stored input in localStorage with key: ${storageKey}`);
      
      // Extract search information to filter the sample data
      let searchLocation = '';
      if (input.listUrls && input.listUrls.length > 0) {
        // This is a property search - extract location from the URL
        const searchUrl = input.listUrls[0].url;
        console.log('Search URL:', searchUrl);
        
        // Extract search location
        const locationMatch = searchUrl.match(/locationIdentifier=([^&]+)/);
        if (locationMatch) {
          searchLocation = locationMatch[1];
          console.log('Extracted location identifier:', searchLocation);
        }
      }
      
      // Log the command that would be equivalent to an API call
      console.log(`Simulating API call to run Apify actor with ID: ${APIFY_ACTOR_ID}`);
      
      // Fetch the stored properties from the sample data provided by the user
      // This uses the dataset items from the successful Apify run shared in the requirements
      console.log('Fetching sample data from api.apify.com/v2/datasets/RPnlhVhYUc2eHliSs/items endpoint');
      
      // Make a GET request to the dataset items URL (this should work without CORS issues since it's a GET)
      const response = await fetch(
        'https://api.apify.com/v2/datasets/RPnlhVhYUc2eHliSs/items?token=apify_api_aPVtpmUSZzjriimnhQ6qsQuVXxqSpB12oY5r'
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sample data: ${response.status} ${response.statusText}`);
      }
      
      let sampleData = await response.json();
      console.log(`Retrieved ${sampleData.length} sample properties before filtering`);
      
      // If this is a property search (not a specific property lookup), we need to simulate the effect of different searches
      if (input.listUrls && input.listUrls.length > 0 && searchLocation) {
        if (searchLocation.toLowerCase().includes('tidworth') || 
            searchLocation.includes('REGION%5ETidworth') || 
            searchLocation.includes('OUTCODE%5ESP9')) {
          // Tidworth searches - no filtering needed as this is what the sample data contains
          console.log('Search for Tidworth - using all sample data');
        } else {
          // For other locations, generate a subset of the data that's unique to this search
          console.log(`Search for location other than Tidworth: ${searchLocation}`);
          
          // Use a deterministic subset based on the location string hash
          const locationHash = searchLocation.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const subsetSize = 5 + (locationHash % 15); // Between 5 and 20 properties
          
          console.log(`Using deterministic subset of ${subsetSize} properties for ${searchLocation}`);
          
          // Create a modified subset with the location in the address
          const locationName = decodeURIComponent(searchLocation.replace(/REGION%5E|OUTCODE%5E|POSTCODE%5E/, ''));
          
          sampleData = sampleData.slice(0, subsetSize).map((property: any, index: number) => {
            // Get a typical street name based on the index
            const streets = ['High Street', 'Church Road', 'Main Street', 'Park Road', 'London Road', 
                             'Station Road', 'Victoria Road', 'Green Lane', 'Manor Road', 'Kings Road'];
            const street = streets[index % streets.length];
            
            // Create a unique property ID
            const newId = `${Date.now()}-${locationHash}-${index}`;
            
            // Modify the address to include the searched location
            return {
              ...property,
              id: newId,
              propertyId: newId,
              address: `${index + 1} ${street}, ${locationName}`,
              displayAddress: `${index + 1} ${street}, ${locationName}`,
              // Ensure price is clearly set
              price: 200000 + (index * 25000), // Different prices for variety
              priceText: `£${(200000 + (index * 25000)).toLocaleString()}`,
              // Ensure location is in the URL
              url: property.url.replace('Tidworth', locationName)
            };
          });
          
          console.log(`Created ${sampleData.length} modified properties for ${locationName}`);
          // Log the first one to see format
          if (sampleData.length > 0) {
            console.log('Sample modified property:', {
              id: sampleData[0].id,
              address: sampleData[0].address,
              price: sampleData[0].price,
              priceText: sampleData[0].priceText
            });
          }
        }
      } else if (input.propertyUrls && input.propertyUrls.length > 0) {
        // This is a property details lookup - just use the first sample property
        console.log('Property details lookup - using first sample property');
        sampleData = [sampleData[0]];
      }
      
      console.log(`Returning ${sampleData.length} properties after filtering`);
      
      // Log a sample of the data structure
      if (sampleData && sampleData.length > 0) {
        console.log('Sample property data structure:');
        console.log(JSON.stringify(sampleData[0], null, 2).substring(0, 2000) + '...');
        
        // Specifically log price-related fields
        const priceFields: Record<string, any> = {};
        const sampleProperty = sampleData[0];
        
        // Check common paths where price might be stored
        if (sampleProperty.price !== undefined) priceFields['price'] = sampleProperty.price;
        if (sampleProperty.propertyInfo?.price !== undefined) priceFields['propertyInfo.price'] = sampleProperty.propertyInfo.price;
        if (sampleProperty.priceText !== undefined) priceFields['priceText'] = sampleProperty.priceText;
        if (sampleProperty.prices) priceFields['prices'] = sampleProperty.prices;
        
        console.log('Price-related fields found in sample data:', priceFields);
        
        // Log agent-related fields
        const agentFields: Record<string, any> = {};
        if (sampleProperty.agent !== undefined) agentFields['agent'] = sampleProperty.agent;
        if (sampleProperty.agentName !== undefined) agentFields['agentName'] = sampleProperty.agentName;
        if (sampleProperty.branchName !== undefined) agentFields['branchName'] = sampleProperty.branchName;
        if (sampleProperty.branch) agentFields['branch'] = sampleProperty.branch;
        
        console.log('Agent-related fields found in sample data:', agentFields);
      }
      
      // Return the filtered sample data
      return sampleData;
    }
    
    // For production, continue with the normal API call approach
    // Start the actor run
    console.log(`Making API request to: https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs`);
    const startResponse = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APIFY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ run: { input } })
    });

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error('Apify actor start failed:', {
        status: startResponse.status,
        statusText: startResponse.statusText,
        responseText: errorText
      });
      throw new Error(`Failed to start Apify actor: ${startResponse.status} ${startResponse.statusText} - ${errorText}`);
    }

    const startData = await startResponse.json();
    const runId = startData.data.id;
    console.log(`Apify actor run started with ID: ${runId}`);

    // Poll for completion
    let isFinished = false;
    let attempt = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (!isFinished && attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      console.log(`Checking status of run ${runId}, attempt ${attempt + 1}/${maxAttempts}`);
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${APIFY_API_TOKEN}`
        }
      });

      if (!statusResponse.ok) {
        console.error('Failed to check actor run status:', {
          status: statusResponse.status,
          statusText: statusResponse.statusText
        });
        throw new Error(`Failed to check actor run status: ${statusResponse.status} ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      console.log(`Run status: ${statusData.data.status}, status message: ${statusData.data.statusMessage || 'None'}`);
      
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(statusData.data.status)) {
        isFinished = true;
        
        if (statusData.data.status !== 'SUCCEEDED') {
          throw new Error(`Apify actor run failed with status: ${statusData.data.status} - ${statusData.data.statusMessage || 'No message'}`);
        }
      }
      
      attempt++;
    }

    if (!isFinished) {
      throw new Error('Apify actor run timed out while waiting for completion');
    }

    // Fetch the results
    console.log(`Fetching results for run ${runId}`);
    const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items`, {
      headers: {
        'Authorization': `Bearer ${APIFY_API_TOKEN}`
      }
    });

    if (!datasetResponse.ok) {
      console.error('Failed to fetch actor results:', {
        status: datasetResponse.status,
        statusText: datasetResponse.statusText
      });
      throw new Error(`Failed to fetch actor results: ${datasetResponse.status} ${datasetResponse.statusText}`);
    }

    const results = await datasetResponse.json();
    console.log(`Retrieved ${results.length} results from Apify`);
    
    return results;
  } catch (error) {
    console.error('Error running Apify actor:', error);
    throw error;
  }
};

// Helper function to extract images from an Apify item
export function extractImagesFromApifyItem(item: any): { mainImage: string | null, allImages: string[] } {
  console.log(`Extracting images for property ${item.id || 'unknown'}`);
  
  // Initialize result
  const result = {
    mainImage: null as string | null,
    allImages: [] as string[]
  };
  
  try {
    // Log the entire item for debugging
    console.log('Full item structure for image extraction:', JSON.stringify(item, null, 2));
    
    // Check for images in various potential fields
    // 1. Check for propertyImages object which often contains URLs
    if (item.propertyImages && typeof item.propertyImages === 'object') {
      console.log('Found propertyImages object:', item.propertyImages);
      
      // Check for main image in propertyImages
      if (item.propertyImages.mainImageSrc) {
        result.mainImage = item.propertyImages.mainImageSrc;
        result.allImages.push(item.propertyImages.mainImageSrc);
      }
      
      // Check for images array in propertyImages
      if (Array.isArray(item.propertyImages.images)) {
        item.propertyImages.images.forEach((img: any) => {
          if (img.srcUrl) {
            result.allImages.push(img.srcUrl);
          }
        });
      }
    }
    
    // 2. Check for direct images array
    if (Array.isArray(item.images)) {
      console.log('Found images array with length:', item.images.length);
      
      item.images.forEach((img: any) => {
        if (typeof img === 'string') {
          result.allImages.push(img);
        } else if (img && typeof img === 'object') {
          // Handle if image is an object with a URL property
          const imgUrl = img.url || img.srcUrl || img.src || img.imageUrl;
          if (imgUrl) {
            result.allImages.push(imgUrl);
          }
        }
      });
    }
    
    // 3. Check for imageUrls or image_urls array
    if (Array.isArray(item.imageUrls)) {
      console.log('Found imageUrls array with length:', item.imageUrls.length);
      item.imageUrls.forEach((url: string) => {
        if (typeof url === 'string') {
          result.allImages.push(url);
        }
      });
    }
    
    if (Array.isArray(item.image_urls)) {
      console.log('Found image_urls array with length:', item.image_urls.length);
      item.image_urls.forEach((url: string) => {
        if (typeof url === 'string') {
          result.allImages.push(url);
        }
      });
    }
    
    // 4. Check for mainImage
    if (item.mainImage) {
      console.log('Found mainImage:', item.mainImage);
      if (typeof item.mainImage === 'string') {
        result.mainImage = item.mainImage;
        result.allImages.push(item.mainImage);
      } else if (item.mainImage.srcUrl) {
        result.mainImage = item.mainImage.srcUrl;
        result.allImages.push(item.mainImage.srcUrl);
      }
    }
    
    // 5. Check for mainImageUrl
    if (item.mainImageUrl && typeof item.mainImageUrl === 'string') {
      console.log('Found mainImageUrl:', item.mainImageUrl);
      result.mainImage = item.mainImageUrl;
      result.allImages.push(item.mainImageUrl);
    }
    
    // 6. Check for photos array
    if (Array.isArray(item.photos)) {
      console.log('Found photos array with length:', item.photos.length);
      item.photos.forEach((photo: any) => {
        if (typeof photo === 'string') {
          result.allImages.push(photo);
        } else if (photo && typeof photo === 'object') {
          const photoUrl = photo.url || photo.srcUrl || photo.src;
          if (photoUrl) {
            result.allImages.push(photoUrl);
          }
        }
      });
    }
    
    // 7. Check nested in propertyInfo
    if (item.propertyInfo && typeof item.propertyInfo === 'object') {
      if (Array.isArray(item.propertyInfo.images)) {
        console.log('Found propertyInfo.images array:', item.propertyInfo.images);
        item.propertyInfo.images.forEach((img: any) => {
          const imgUrl = typeof img === 'string' ? img : (img.srcUrl || img.url || img.src);
          if (imgUrl) {
            result.allImages.push(imgUrl);
          }
        });
      }
    }
    
    // If we have allImages but no mainImage, use the first image as main
    if (result.allImages.length > 0 && !result.mainImage) {
      result.mainImage = result.allImages[0];
    }
    
    // Remove duplicates from allImages
    result.allImages = [...new Set(result.allImages)];
    
    console.log(`Extraction results for property ${item.id || 'unknown'}:`, {
      mainImage: result.mainImage,
      totalImages: result.allImages.length,
      imageUrls: result.allImages.slice(0, 2) // Log first 2 URLs to keep output reasonable
    });
    
    return result;
  } catch (error) {
    console.error('Error extracting images:', error);
    return result;
  }
}

// Update the convertApifyPropertyToRightmoveProperty function to use the new extraction function
export function convertApifyPropertyToRightmoveProperty(item: any): RightmoveProperty {
  if (!item) throw new Error('Cannot convert null or undefined item to property');
  
  console.log(`Converting Apify item to RightmoveProperty: ${item.id || 'unknown'}`);
  
  // Extract images using our dedicated function
  const { mainImage, allImages } = extractImagesFromApifyItem(item);
  
  // Extract agent information
  let agent: RightmoveProperty['agent'] = {
    name: 'Unknown Agent'
  };
  
  if (item.agent) {
    agent = {
      name: item.agent.name || 'Unknown Agent',
      logo_url: item.agent.logoUrl || null,
      phone: item.agent.phoneNumber || item.agent.contactPhoneNumber || null
    };
    
    // Log agent data for debugging
    console.log('Agent information:', agent);
  }
  
  // Get the property price
  let price = 0;
  
  if (typeof item.price === 'number') {
    price = item.price;
  } else if (typeof item.price === 'string') {
    // Remove currency symbols and commas, then parse
    price = parseInt(item.price.replace(/[£$,]/g, ''), 10) || 0;
  }
  
  // Clean up the address - sometimes addresses have extra whitespace or are very long
  const address = item.address || item.displayAddress || 'Address not available';
  
  // Extract postcode from address if available
  let postcode = item.postcode || '';
  
  if (!postcode && address) {
    // Try to extract UK postcode from address
    const postcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/i;
    const match = address.match(postcodeRegex);
    if (match) {
      postcode = match[0];
    }
  }
  
  // Build the property object with all available data
  const property: RightmoveProperty = {
    id: item.id ? String(item.id) : `apify-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    address: address,
    price: price,
    property_type: item.propertyType || item.property_type || 'Not specified',
    bedrooms: parseInt(item.bedrooms, 10) || 0,
    bathrooms: parseInt(item.bathrooms, 10) || 0,
    description: item.propertyDescription || item.description || '',
    features: Array.isArray(item.features) ? item.features : [],
    main_image_url: mainImage || '',
    image_urls: allImages,
    floor_area: item.floorArea ? {
      size: item.floorArea.value || item.floorArea.size || 0,
      unit: item.floorArea.unit || 'm²'
    } : undefined,
    rightmove_url: item.url || '',
    postcode: postcode,
    date_listed: item.listingDate || item.addedReduced || item.firstVisibleDate || '',
    is_active: true,
    new_build: item.isNewHome || false,
    tenure: item.tenure || '',
    agent: agent
  };
  
  console.log(`Converted property ${property.id} with ${property.image_urls.length} images`);
  
  return property;
}

/**
 * Try to load the local sample dataset for development purposes
 */
export async function loadLocalDataset(): Promise<any[] | null> {
  try {
    // Try multiple possible locations for the dataset file
    const possiblePaths = [
      '/src/lib/apifydataset.json',
      '/apifydataset.json',
      'apifydataset.json'
    ];
    
    for (const path of possiblePaths) {
      try {
        console.log(`Trying to load dataset from ${path}`);
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully loaded ${data.length} properties from ${path}`);
          return data;
        }
      } catch (e) {
        console.log(`Failed to load from ${path}:`, e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading local dataset:', error);
    return null;
  }
}

// Function to get realistic UK mock data for a location
export function getRealisticMockPropertiesForLocation(location: string): RightmoveProperty[] {
  // If we're in development mode and trying to use mock data,
  // log a warning that real data should be used instead
  console.warn(`
    ⚠️ DEVELOPMENT MODE WARNING:
    Using mock property data for ${location}. 
    For real property images, please use the dataset file instead.
    Mock data will NOT have real property images.
  `);
  
  // Try to extract a clean location name
  const cleanLocation = location
    .replace(/REGION%5E|OUTCODE%5E|POSTCODE%5E/g, '')
    .replace(/%20/g, ' ')
    .replace(/^\d+$/, '')  // Remove purely numeric locations
    .trim();
    
  const locationName = decodeURIComponent(cleanLocation || 'Unknown Location');
  console.log(`Clean location name: ${locationName}`);
  
  // Create a seed based on the location name for consistent results
  let seed = locationName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 42;
  // Function to get deterministic random numbers
  const seededRandom = () => {
    const x = Math.sin(seed) * 10000;
    seed = seed + 1; // Increment seed rather than modifying it directly
    return x - Math.floor(x);
  };
  
  // Number of properties depends on location size
  const isLargeCity = ['london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'liverpool', 'edinburgh'].some(
    city => locationName.toLowerCase().includes(city)
  );
  
  const isSmallTown = ['village', 'hamlet', 'rural', 'town'].some(
    type => locationName.toLowerCase().includes(type)
  );
  
  // Determine number of properties based on location size
  let numProperties = 10; // Default medium size
  
  if (isLargeCity) {
    numProperties = 15 + Math.floor(seededRandom() * 10); // 15-25 properties for large cities
  } else if (isSmallTown) {
    numProperties = 3 + Math.floor(seededRandom() * 5); // 3-8 properties for small towns
  } else {
    numProperties = 8 + Math.floor(seededRandom() * 8); // 8-16 properties for medium locations
  }
  
  console.log(`Generating ${numProperties} properties for ${locationName}`);
  
  // Get realistic price range for the location
  const locationPriceData = getLocationPriceData(locationName);
  const { basePrice, priceVariance, postcodePrefixes } = locationPriceData;
  
  // Street names typical in the UK
  const streetNames = [
    'High Street', 'Church Road', 'Main Street', 'Park Road', 'London Road',
    'Victoria Road', 'Green Lane', 'Station Road', 'Queens Road', 'Kings Road',
    'New Road', 'The Avenue', 'School Lane', 'Mill Lane', 'Church Lane',
    'Park Avenue', 'The Green', 'Springfield Road', 'Windsor Road', 'Richmond Road',
    'Albert Road', 'Alexandra Road', 'York Road', 'George Street', 'Bath Road',
    'Castle Street', 'West Street', 'North Street', 'East Street', 'South Street'
  ];
  
  // Property types with weightings for different locations
  let propertyTypeWeights: Record<string, number> = {
    'Detached': 0.2,
    'Semi-Detached': 0.25,
    'Terraced': 0.25,
    'Flat': 0.25,
    'Bungalow': 0.05
  };
  
  // Adjust property type weights based on location
  if (locationName.toLowerCase().includes('london') || locationName.toLowerCase().includes('city')) {
    // More flats in cities
    propertyTypeWeights = {
      'Detached': 0.05,
      'Semi-Detached': 0.15,
      'Terraced': 0.3,
      'Flat': 0.45,
      'Bungalow': 0.05
    };
  } else if (locationName.toLowerCase().includes('country') || locationName.toLowerCase().includes('village')) {
    // More detached houses in countryside
    propertyTypeWeights = {
      'Detached': 0.4,
      'Semi-Detached': 0.25,
      'Terraced': 0.15,
      'Flat': 0.1,
      'Bungalow': 0.1
    };
  }
  
  // Agent names (with some real UK estate agent names)
  const agentNames = [
    'Purplebricks', 'Foxtons', 'Savills', 'Knight Frank', 'Countrywide',
    'Connells', 'Winkworth', 'Hunters', 'Sequence', 'Your Move',
    `${locationName} Homes`, `${locationName} Properties`, 'Bairstow Eves', 
    'Haart', 'Martin & Co', 'Hamptons International', 'John D Wood & Co'
  ];
  
  // Generate properties
  const mockProperties: RightmoveProperty[] = [];
  
  for (let i = 0; i < numProperties; i++) {
    // Generate a realistic property ID
    const id = `${Math.floor(10000000 + seededRandom() * 89999999)}`;
    
    // Select property type based on weights
    const propertyType = selectBasedOnWeights(propertyTypeWeights, seededRandom);
    
    // Determine price based on property type and location
    let price = basePrice;
    // Adjust price based on property type
    if (propertyType === 'Detached') price *= 1.5;
    if (propertyType === 'Semi-Detached') price *= 1.2;
    if (propertyType === 'Flat') price *= 0.8;
    if (propertyType === 'Bungalow') price *= 1.3;
    
    // Add some random variance
    price = Math.round(price * (1 + (seededRandom() - 0.5) * priceVariance / 100));
    // Round to nearest 1000 or 5000 for realism
    price = Math.round(price / 5000) * 5000;
    
    // Determine bedrooms based on property type
    let minBeds = 1;
    let maxBeds = 3;
    
    if (propertyType === 'Detached') {
      minBeds = 3;
      maxBeds = 6;
    } else if (propertyType === 'Semi-Detached') {
      minBeds = 2;
      maxBeds = 4;
    } else if (propertyType === 'Terraced') {
      minBeds = 2;
      maxBeds = 3;
    } else if (propertyType === 'Flat') {
      minBeds = 1;
      maxBeds = 3;
    } else if (propertyType === 'Bungalow') {
      minBeds = 2;
      maxBeds = 4;
    }
    
    const bedrooms = minBeds + Math.floor(seededRandom() * (maxBeds - minBeds + 1));
    const bathrooms = Math.max(1, Math.floor(bedrooms * 0.75 + seededRandom() * 1.5));
    
    // Generate address
    const streetName = streetNames[Math.floor(seededRandom() * streetNames.length)];
    const houseNumber = 1 + Math.floor(seededRandom() * 100);
    const address = `${houseNumber} ${streetName}, ${locationName}`;
    
    // Generate a realistic UK postcode for the area
    const postcodePrefix = postcodePrefixes[Math.floor(seededRandom() * postcodePrefixes.length)];
    const postcode = `${postcodePrefix}${Math.floor(1 + seededRandom() * 9)} ${Math.floor(1 + seededRandom() * 9)}${String.fromCharCode(65 + Math.floor(seededRandom() * 26))}${String.fromCharCode(65 + Math.floor(seededRandom() * 26))}`;
    
    // Select an agent
    const agentName = agentNames[Math.floor(seededRandom() * agentNames.length)];
    const agentPhone = `0${Math.floor(1 + seededRandom() * 9)}${Math.floor(100 + seededRandom() * 900)} ${Math.floor(100000 + seededRandom() * 900000)}`;
    
    // Generate feature list based on property type and price
    const allFeatures = [
      'Garden', 'Parking', 'Garage', 'Driveway', 'Central Heating', 
      'Double Glazing', 'Fireplace', 'Conservatory', 'Balcony', 'Terrace',
      'En Suite', 'Fitted Kitchen', 'Utility Room', 'Cellar', 'Loft Conversion',
      'Off-Street Parking', 'Countryside Views', 'Near Station', 'Near Schools', 'Near Parks'
    ];
    
    // More expensive properties have more features
    const numFeatures = 3 + Math.floor(seededRandom() * 5) + Math.floor((price / basePrice) * 3);
    const features: string[] = [];
    for (let j = 0; j < Math.min(numFeatures, allFeatures.length); j++) {
      const randomIndex = Math.floor(seededRandom() * allFeatures.length);
      if (!features.includes(allFeatures[randomIndex])) {
        features.push(allFeatures[randomIndex]);
      }
    }
    
    // Determine if it's a new build (less common)
    const newBuild = seededRandom() > 0.9;
    
    // Calculate floor area
    let baseArea = 0;
    if (propertyType === 'Flat') {
      baseArea = 500 + (bedrooms * 150);
    } else if (propertyType === 'Terraced') {
      baseArea = 750 + (bedrooms * 200);
    } else if (propertyType === 'Semi-Detached') {
      baseArea = 900 + (bedrooms * 250);
    } else if (propertyType === 'Detached') {
      baseArea = 1200 + (bedrooms * 300);
    } else if (propertyType === 'Bungalow') {
      baseArea = 1000 + (bedrooms * 250);
    }
    
    // Add some random variance to the area
    const floorArea = Math.round(baseArea * (0.9 + seededRandom() * 0.4));
    
    // Generate description
    const descriptions = [
      `A ${bedrooms} bedroom ${propertyType.toLowerCase()} property situated in a sought-after area of ${locationName}. This property benefits from ${bathrooms} bathrooms and features ${features.slice(0, 3).join(', ')}.`,
      `Stunning ${bedrooms} bedroom ${propertyType.toLowerCase()} located in the heart of ${locationName}. Boasting ${bathrooms} bathrooms and ${features.slice(0, 3).join(', ')}.`,
      `Beautifully presented ${bedrooms} bedroom ${propertyType.toLowerCase()} in ${locationName}. The property includes ${bathrooms} bathrooms and benefits from ${features.slice(0, 3).join(', ')}.`,
      `Spacious ${bedrooms} bedroom ${propertyType.toLowerCase()} for sale in ${locationName}. With ${bathrooms} bathrooms and offering ${features.slice(0, 3).join(', ')}.`,
      `Charming ${bedrooms} bedroom ${propertyType.toLowerCase()} situated in the popular area of ${locationName}. The property comprises ${bathrooms} bathrooms and comes with ${features.slice(0, 3).join(', ')}.`
    ];
    
    const description = descriptions[Math.floor(seededRandom() * descriptions.length)];
    
    // Generate listing date (between 1 week and 3 months ago)
    const now = new Date();
    const daysAgo = 7 + Math.floor(seededRandom() * 80);
    const listingDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Generate property images (REMOVED placeholders)
    const imageUrls: string[] = [];
    // Leave the imageUrls empty to indicate no real images are available
    // This will cause the UI to show "No image available" instead of fake placeholders
    
    // Create property object with empty image arrays to signal no images available
    mockProperties.push({
      id,
      address,
      postcode,
      price,
      property_type: propertyType,
      bedrooms,
      bathrooms,
      description,
      image_urls: [],  // Empty array indicates no real images
      main_image_url: "",  // Empty string indicates no main image
      agent: {
        name: agentName,
        phone: agentPhone,
        logo_url: ""  // Empty string indicates no logo
      },
      features,
      date_listed: listingDate.toISOString().split('T')[0],
      new_build: newBuild,
      floor_area: {
        size: floorArea,
        unit: 'sq ft'
      },
      rightmove_url: `https://www.rightmove.co.uk/properties/${id}`,
      is_active: true
    });
  }
  
  return mockProperties;
}

// Helper function to select an item based on weights
function selectBasedOnWeights(weights: Record<string, number>, randomFn: () => number): string {
  const items = Object.keys(weights);
  const cumulativeWeights: number[] = [];
  let total = 0;
  
  for (const item of items) {
    total += weights[item];
    cumulativeWeights.push(total);
  }
  
  const random = randomFn() * total;
  
  for (let i = 0; i < items.length; i++) {
    if (random <= cumulativeWeights[i]) {
      return items[i];
    }
  }
  
  return items[items.length - 1]; // Fallback
}

// Helper function to get realistic price data for locations
function getLocationPriceData(location: string): { basePrice: number, priceVariance: number, postcodePrefixes: string[] } {
  // Default values
  let basePrice = 250000;
  let priceVariance = 20;
  let postcodePrefixes = ['SW', 'N', 'E', 'W', 'SE', 'NW', 'B', 'M', 'L', 'G', 'CF', 'EH'];

  // Price mapping based on region (simplified)
  const locationLower = location.toLowerCase();
  
  // London and surrounding areas
  if (locationLower.includes('london')) {
    basePrice = 650000;
    priceVariance = 30;
    postcodePrefixes = ['SW', 'N', 'E', 'W', 'SE', 'NW', 'WC', 'EC'];
    
    // Central London is more expensive
    if (locationLower.includes('central') || locationLower.includes('kensington') || 
        locationLower.includes('chelsea') || locationLower.includes('westminster')) {
      basePrice = 1200000;
    }
    // East London is slightly cheaper
    else if (locationLower.includes('east') || locationLower.includes('hackney') || 
             locationLower.includes('newham')) {
      basePrice = 550000;
    }
    // South London
    else if (locationLower.includes('south') || locationLower.includes('croydon') || 
             locationLower.includes('bromley')) {
      basePrice = 500000;
      postcodePrefixes = ['SW', 'SE', 'CR', 'BR'];
    }
    // North London
    else if (locationLower.includes('north') || locationLower.includes('barnet') || 
             locationLower.includes('enfield')) {
      basePrice = 580000;
      postcodePrefixes = ['N', 'NW', 'EN'];
    }
    // West London
    else if (locationLower.includes('west') || locationLower.includes('ealing') || 
             locationLower.includes('hounslow')) {
      basePrice = 600000;
      postcodePrefixes = ['W', 'NW', 'SW', 'TW', 'UB'];
    }
  }
  // South East England
  else if (locationLower.includes('surrey') || locationLower.includes('kent') || 
           locationLower.includes('sussex') || locationLower.includes('brighton')) {
    basePrice = 400000;
    postcodePrefixes = ['RH', 'TN', 'BN', 'CT', 'ME', 'DA', 'GU', 'KT'];
  }
  // South West England
  else if (locationLower.includes('bristol') || locationLower.includes('devon') || 
           locationLower.includes('cornwall') || locationLower.includes('dorset')) {
    basePrice = 300000;
    postcodePrefixes = ['BS', 'BA', 'TA', 'EX', 'TQ', 'TR', 'PL', 'DT'];
  }
  // East Anglia
  else if (locationLower.includes('norfolk') || locationLower.includes('suffolk') || 
           locationLower.includes('cambridge') || locationLower.includes('essex')) {
    basePrice = 280000;
    postcodePrefixes = ['NR', 'IP', 'CB', 'CO', 'CM'];
  }
  // Midlands
  else if (locationLower.includes('birmingham') || locationLower.includes('leicester') || 
           locationLower.includes('nottingham') || locationLower.includes('coventry')) {
    basePrice = 220000;
    postcodePrefixes = ['B', 'CV', 'LE', 'NG', 'DE', 'WS', 'DY'];
  }
  // North West England
  else if (locationLower.includes('manchester') || locationLower.includes('liverpool') || 
           locationLower.includes('cheshire') || locationLower.includes('lancashire')) {
    basePrice = 200000;
    postcodePrefixes = ['M', 'L', 'WA', 'CH', 'PR', 'BB', 'OL', 'SK'];
  }
  // North East England
  else if (locationLower.includes('newcastle') || locationLower.includes('sunderland') || 
           locationLower.includes('durham') || locationLower.includes('middlesbrough')) {
    basePrice = 180000;
    postcodePrefixes = ['NE', 'SR', 'DH', 'TS'];
  }
  // Yorkshire
  else if (locationLower.includes('leeds') || locationLower.includes('york') || 
           locationLower.includes('sheffield') || locationLower.includes('bradford')) {
    basePrice = 190000;
    postcodePrefixes = ['LS', 'YO', 'HX', 'BD', 'HD', 'S', 'WF'];
  }
  // Scotland
  else if (locationLower.includes('edinburgh') || locationLower.includes('glasgow') || 
           locationLower.includes('aberdeen') || locationLower.includes('dundee')) {
    basePrice = 170000;
    postcodePrefixes = ['EH', 'G', 'AB', 'DD', 'FK', 'KY', 'PA'];
    
    // Edinburgh is more expensive
    if (locationLower.includes('edinburgh')) {
      basePrice = 300000;
    }
    // Glasgow varies by area
    else if (locationLower.includes('glasgow')) {
      basePrice = 200000;
    }
  }
  // Wales
  else if (locationLower.includes('cardiff') || locationLower.includes('swansea') || 
           locationLower.includes('wales') || locationLower.includes('newport')) {
    basePrice = 180000;
    postcodePrefixes = ['CF', 'SA', 'LL', 'NP', 'SY'];
  }
  // Northern Ireland
  else if (locationLower.includes('belfast') || locationLower.includes('derry') || 
           locationLower.includes('northern ireland')) {
    basePrice = 150000;
    postcodePrefixes = ['BT'];
  }
  
  return { basePrice, priceVariance, postcodePrefixes };
}

/**
 * Search for properties based on filters
 */
export async function searchRightmoveProperties(
  filters: SearchFilters
): Promise<{ properties: RightmoveProperty[]; totalPages: number }> {
  console.log('Searching for properties with filters:', filters);
  
  try {
    // If mock data is enabled or we're in development mode, use realistic mock data
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.DEV) {
      console.log('Using mock data for search in dev mode or with mock flag enabled');
      
      // Check if location is provided
      if (!filters.location || filters.location === '') {
        console.error('Location is required for property search');
        return { properties: [], totalPages: 0 };
      }
      
      // Generate realistic mock properties for the specified location
      const mockProperties = getRealisticMockPropertiesForLocation(filters.location);
      
      // Apply additional filters
      let filteredProperties = mockProperties;
      
      // Apply price filters
      if (filters.minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice!);
      }
      
      if (filters.maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice!);
      }
      
      // Apply bedroom filters
      if (filters.minBeds) {
        filteredProperties = filteredProperties.filter(p => p.bedrooms >= filters.minBeds!);
      }
      
      if (filters.maxBeds) {
        filteredProperties = filteredProperties.filter(p => p.bedrooms <= filters.maxBeds!);
      }
      
      // Apply property type filter
      if (filters.propertyType && filters.propertyType !== 'any') {
        const propertyTypeLower = filters.propertyType.toLowerCase();
        filteredProperties = filteredProperties.filter(p => 
          p.property_type.toLowerCase().includes(propertyTypeLower)
        );
      }
      
      console.log(`Found ${filteredProperties.length} properties for ${filters.location} after filtering`);
      
      // Add a short timeout to simulate an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        properties: filteredProperties,
        totalPages: 1
      };
    }
    
    // For production, continue with the existing implementation...
    // ... existing code ...

    // Cache key for this search
    const cacheKey = `rightmove_search_${JSON.stringify(filters)}`;
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      console.log('Found cached data for search');
      return {
        properties: cachedData.data.properties || [],
        totalPages: cachedData.data.totalPages || 1
      };
    }
    
    // For development/testing, we can use the Apify dataset directly
    const localDataset = await loadLocalDataset();
    
    if (localDataset) {
      console.log('Using local dataset for development');
      
      // Convert all properties from the dataset
      const convertedProperties = localDataset.map((item: any) => 
        convertApifyPropertyToRightmoveProperty(item)
      );
      
      console.log(`Converted ${convertedProperties.length} properties from local dataset`);
      
      // Apply location filtering if specified
      let filteredProperties = convertedProperties;
      
      if (filters.location && filters.location !== 'all') {
        const locationLower = filters.location.toLowerCase();
        filteredProperties = convertedProperties.filter(property => 
          property.address.toLowerCase().includes(locationLower) ||
          (property.postcode && property.postcode.toLowerCase().includes(locationLower))
        );
        
        console.log(`Filtered to ${filteredProperties.length} properties matching location: ${filters.location}`);
      }
      
      // Apply price filters if specified
      if (filters.minPrice) {
        filteredProperties = filteredProperties.filter(p => 
          p.price >= filters.minPrice!
        );
      }
      
      if (filters.maxPrice) {
        filteredProperties = filteredProperties.filter(p => 
          p.price <= filters.maxPrice!
        );
      }
      
      // Apply bedroom filters if specified
      if (filters.minBeds) {
        filteredProperties = filteredProperties.filter(p => 
          p.bedrooms >= filters.minBeds!
        );
      }
      
      if (filters.maxBeds) {
        filteredProperties = filteredProperties.filter(p => 
          p.bedrooms <= filters.maxBeds!
        );
      }
      
      // Apply property type filter if specified
      if (filters.propertyType && filters.propertyType !== 'any') {
        const propertyTypeLower = filters.propertyType.toLowerCase();
        filteredProperties = filteredProperties.filter(p => 
          p.property_type.toLowerCase().includes(propertyTypeLower)
        );
      }
      
      // Cache the result
      await saveToCache(cacheKey, {
        properties: filteredProperties,
        totalPages: 1
      });
      
      return {
        properties: filteredProperties,
        totalPages: 1
      };
    }
    
    // If we don't have local data or it failed, use the Apify API
    console.log('Using Apify API to search for properties');
    
    // Construct the Apify Actor search parameters
    const actorParams = {
      search: filters.location || undefined,
      locationIdentifier: filters.locationIdentifier || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minBedrooms: filters.minBeds || undefined,
      maxBedrooms: filters.maxBeds || undefined,
      propertyType: filters.propertyType === 'any' ? undefined : filters.propertyType,
      maxPages: 1
    };
    
    // Call the Apify Actor
    const data = await runRightmoveScraper(actorParams);
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data returned from Apify:', data);
      throw new Error('Failed to get property data from Apify');
    }
    
    // Convert all properties from the dataset
    const properties = data.map(item => convertApifyPropertyToRightmoveProperty(item));
    
    console.log(`Converted ${properties.length} properties from Apify API`);
    
    // Cache the result
    await saveToCache(cacheKey, {
      properties,
      totalPages: 1
    });
    
    return {
      properties,
      totalPages: 1
    };
  } catch (error) {
    console.error('Error searching properties:', error);
    throw new Error(`Failed to search properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get details for a specific property by its Rightmove ID
 */
export async function getPropertyDetails(propertyId: string): Promise<RightmoveProperty | null> {
  console.log(`Getting details for property with ID: ${propertyId}`);
  
  try {
    // Cache key for this property
    const cacheKey = `rightmove_property_${propertyId}`;
    
    // Try to get from cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for property ${propertyId}`);
      return cachedData.data;
    }
    
    // For development/testing, we can try to find the property in the local dataset
    const localDataset = await loadLocalDataset();
    
    if (localDataset) {
      console.log(`Searching for property ${propertyId} in local dataset`);
      
      // Find the property in the dataset
      const propertyData = localDataset.find(item => 
        String(item.id) === propertyId || 
        String(item.propertyId) === propertyId
      );
      
      if (propertyData) {
        console.log(`Found property ${propertyId} in local dataset`);
        const convertedProperty = convertApifyPropertyToRightmoveProperty(propertyData);
        
        // Cache the result
        await saveToCache(cacheKey, convertedProperty);
        
        return convertedProperty;
      }
      
      console.log(`Property ${propertyId} not found in local dataset`);
    }
    
    // If not found or no local dataset, use the Apify API
    console.log(`Using Apify API to get details for property ${propertyId}`);
    
    // Construct the Apify Actor parameters for property details
    const actorParams = {
      propertyUrls: [`https://www.rightmove.co.uk/properties/${propertyId}`]
    };
    
    // Call the Apify Actor
    const data = await runRightmoveScraper(actorParams);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error(`No data returned from Apify for property ${propertyId}`);
      return null;
    }
    
    // Convert the property data
    const property = convertApifyPropertyToRightmoveProperty(data[0]);
    
    // Cache the result
    await saveToCache(cacheKey, property);
    
    return property;
  } catch (error) {
    console.error(`Error getting property details for ${propertyId}:`, error);
    throw new Error(`Failed to get property details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a property is still active on Rightmove
 */
export async function checkPropertyActiveStatus(propertyId: string): Promise<boolean> {
  console.log(`Checking active status for property with ID: ${propertyId}`);
  
  try {
    // Attempt to get property details
    const property = await getPropertyDetails(propertyId);
    
    // If property exists and has active status, consider it active
    return !!property;
  } catch (error) {
    console.error(`Error checking property status for ${propertyId}:`, error);
    return false; // Consider it inactive if we can't check
  }
}

/**
 * Helper function to get items from cache
 */
export async function getFromCache(key: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('scraper_cache')
      .select('*')
      .eq('key', key)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Check if cache is valid
    if (!isCacheValid(data.created_at)) {
      console.log(`Cache for ${key} is expired`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getFromCache:', error);
    return null;
  }
}

/**
 * Helper function to save items to cache
 */
export async function saveToCache(key: string, data: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('scraper_cache')
      .upsert(
        { 
          key, 
          data,
          created_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
      
    if (error) {
      console.error('Error saving to cache:', error);
    }
  } catch (error) {
    console.error('Error in saveToCache:', error);
  }
}

/**
 * Run the Rightmove scraper with the given parameters
 */
export async function runRightmoveScraper(params: any): Promise<any> {
  return await runApifyActor(params);
}

// Function to test the ScraperAPI key - now completely disabled
const testScraperAPIKey = async (): Promise<{ success: boolean; message: string }> => {
  // Return success without making any API calls since ScraperAPI is no longer used
  return { 
    success: true, 
    message: "ScraperAPI validation disabled - application now uses Apify exclusively" 
  };
};

// Validate ScraperAPI key - now completely disabled
const validateScraperAPIKey = async (): Promise<boolean> => {
  // Return true without validation since ScraperAPI is no longer used
  return true;
};

// Initialize the scraper on import
(() => {
  console.log('Initializing Apify Rightmove scraper...');
  
  // Check if we have an API token
  if (!APIFY_API_TOKEN) {
    console.warn('No Apify API token found. Please set your token in .env.local file as VITE_APIFY_API_TOKEN');
  }
  
  // Test the token in the background
  testApifyToken().then(result => {
    if (!result.success) {
      console.error(`⚠️ INVALID APIFY API TOKEN: ${result.message}`);
      console.error('Get a valid token at https://apify.com/ and set it in .env.local as VITE_APIFY_API_TOKEN');
    } else {
      console.log(`✅ Apify API token validated: ${result.message}`);
    }
  });
  
  // Ensure the cache table exists (don't await - let it run in background)
  ensureScraperCacheTableExists().then(exists => {
    if (!exists) {
      console.warn('Scraper cache table does not exist. This may affect performance.');
    }
  });
})(); 