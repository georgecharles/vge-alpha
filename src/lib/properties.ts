import { supabase } from './supabaseClient';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface Property {
  id: string;
  title: string;
  description: string | null;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  image_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedProperty {
  id: string;
  user_id: string;
  property_id: string;
  notes: string;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  roi_percentage: number;
  investment_term: string;
  property_type: string;
  deal_type: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export async function getFeaturedProperties(page: number, perPage: number) {
  try {
    const start = (page - 1) * perPage;
    
    console.log('Production URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Fetching properties with params:', { page, perPage, start });
    
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        location,
        price,
        beds,
        baths,
        sqft,
        image_url,
        is_featured,
        created_at,
        updated_at
      `)
      .eq('is_featured', true)
      .range(start, start + perPage - 1)
      .order('created_at', { ascending: false });

    console.log('Raw Supabase response:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No properties found');
      return [];
    }

    // Map the data to ensure all required fields are present
    const properties = data.map(p => ({
      id: p.id || '',
      title: p.title || '',
      description: p.description || '',
      location: p.location || '',
      price: Number(p.price) || 0,
      beds: Number(p.beds) || 0,
      baths: Number(p.baths) || 0,
      sqft: Number(p.sqft) || 0,
      image_url: p.image_url || '',
      is_featured: Boolean(p.is_featured),
      created_at: p.created_at || new Date().toISOString(),
      updated_at: p.updated_at || new Date().toISOString()
    }));

    console.log('Mapped properties:', properties);
    return properties;

  } catch (error) {
    console.error('Error in getFeaturedProperties:', error);
    return [];
  }
}

export const useFeaturedProperties = (limit = 6) => {
  return useInfiniteQuery({
    queryKey: ['featuredProperties'],
    queryFn: ({ pageParam = 1 }) => getFeaturedProperties(pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache data for 30 minutes
  });
};

export async function searchProperties(searchTerm: string): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        location,
        price,
        sqft,
        beds,
        baths,
        description,
        image_url,
        is_featured,
        created_at,
        updated_at
      `)
      .or(`
        location.ilike.%${searchTerm}%,
        description.ilike.%${searchTerm}%,
        title.ilike.%${searchTerm}%
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching properties:', error);
    return [];
  }
}

export async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(`
      id,
      title,
      location,
      price,
      sqft,
      beds,
      baths,
      description,
      image_url,
      is_featured,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function saveProperty(
  propertyId: string,
  userId: string,
  notes: string = "",
) {
  const { data, error } = await supabase
    .from("saved_properties")
    .insert([
      {
        property_id: propertyId,
        user_id: userId,
        notes,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as SavedProperty;
}

export async function getSavedProperties(userId: string) {
  const { data, error } = await supabase
    .from("saved_properties")
    .select(
      `
      *,
      property:properties(*)
    `,
    )
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getDeals(page: number, perPage: number) {
  try {
    const start = (page - 1) * perPage;
    
    console.log('Fetching deals with params:', { page, perPage, start });
    
    const { data, error } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        description,
        location,
        price,
        roi_percentage,
        investment_term,
        property_type,
        deal_type,
        image_url,
        created_at,
        updated_at
      `)
      .range(start, start + perPage - 1)
      .order('created_at', { ascending: false });

    console.log('Raw Supabase deals response:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No deals found');
      return [];
    }

    // Map the data to ensure all required fields are present
    const deals = data.map(d => ({
      id: d.id || '',
      title: d.title || '',
      description: d.description || '',
      location: d.location || '',
      price: Number(d.price) || 0,
      roi_percentage: Number(d.roi_percentage) || 0,
      investment_term: d.investment_term || '',
      property_type: d.property_type || '',
      deal_type: d.deal_type || '',
      image_url: d.image_url || '',
      created_at: d.created_at || new Date().toISOString(),
      updated_at: d.updated_at || new Date().toISOString()
    }));

    console.log('Mapped deals:', deals);
    return deals;

  } catch (error) {
    console.error('Error in getDeals:', error);
    return [];
  }
}

export const useDeals = (limit = 6) => {
  return useInfiniteQuery({
    queryKey: ['deals'],
    queryFn: ({ pageParam = 1 }) => getDeals(pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};
