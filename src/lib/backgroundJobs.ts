import { supabase } from './supabase';
import { checkPropertyActiveStatus, purgeExpiredCache } from './rightmoveScraper';

// Check if listings are still active
export const checkActiveListings = async () => {
  try {
    // Get property IDs from cache to check (limit to 50 at a time to avoid overwhelming ScraperAPI)
    const { data: cachedProperties, error } = await supabase
      .from('scraper_cache')
      .select('key')
      .like('key', 'rightmove:property:%')
      .eq('is_active', true)
      .limit(50);
    
    if (error) {
      throw error;
    }
    
    if (!cachedProperties || cachedProperties.length === 0) {
      console.log('No properties to check');
      return 0;
    }
    
    console.log(`Checking active status for ${cachedProperties.length} properties`);
    
    // Process each property
    let inactiveCount = 0;
    
    for (const cachedProperty of cachedProperties) {
      // Extract property ID from the key
      const propertyId = cachedProperty.key.replace('rightmove:property:', '');
      
      // Check if property is still active
      const isActive = await checkPropertyActiveStatus(propertyId);
      
      if (!isActive) {
        inactiveCount++;
      }
      
      // Introduce a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Found ${inactiveCount} inactive properties`);
    return inactiveCount;
  } catch (error) {
    console.error('Error checking active listings:', error);
    return 0;
  }
};

// Clean up expired cache entries
export const cleanupExpiredCache = async () => {
  try {
    const deletedCount = await purgeExpiredCache();
    console.log(`Purged ${deletedCount} expired cache entries`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired cache:', error);
    return 0;
  }
};

// Main function to run all background jobs
export const runBackgroundJobs = async () => {
  console.log('Running background jobs...');
  
  // First, purge expired cache
  await cleanupExpiredCache();
  
  // Then check active listings
  await checkActiveListings();
  
  console.log('Background jobs completed');
};

// Function to set up background jobs to run periodically
export const setupBackgroundJobs = () => {
  // Run initially after a short delay
  setTimeout(() => runBackgroundJobs(), 30000);
  
  // Then run every 24 hours
  setInterval(() => runBackgroundJobs(), 24 * 60 * 60 * 1000);
  
  console.log('Background jobs scheduled');
}; 