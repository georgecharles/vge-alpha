import { supabase } from './supabase';

export interface ScrapedProperty {
  id: string;
  title: string;
  price: number;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image_url: string;
  property_type: string;
  source_url: string;
  added_by_user_id: string;
  is_featured: boolean;
}

export interface SearchResults {
  properties: ScrapedProperty[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

// Use production URL in production, fallback to localhost for development
const API_URL = import.meta.env.PROD 
  ? 'https://api.myvge.com'  // Production API URL
  : 'http://localhost:3001';  // Development URL

export async function searchProperties(location: string, page = 1): Promise<SearchResults> {
  try {
    console.log('Searching properties:', { location, page, apiUrl: API_URL });
    const response = await fetch(`${API_URL}/api/scrape-properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://myvge.com'
      },
      body: JSON.stringify({ location, page }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Server error:', error);
      throw new Error(error.message || 'Failed to fetch properties');
    }

    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
}

export async function importProperties(properties: ScrapedProperty[], userId: string) {
  try {
    console.log('Importing properties:', { count: properties.length, userId });
    const { data, error } = await supabase
      .from('properties')
      .insert(
        properties.map(property => ({
          ...property,
          added_by_user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      );

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Import successful:', data);
    return data;
  } catch (error) {
    console.error('Error importing properties:', error);
    throw error;
  }
} 