import { supabase } from './supabaseClient';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  sqft: number;
  beds: number;
  baths: number;
  description: string;
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

export async function getFeaturedProperties(page: number, perPage: number) {
  try {
    const start = (page - 1) * perPage;
    
    console.log('Fetching properties with params:', { page, perPage, start });
    
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
      .range(start, start + perPage - 1)
      .order('created_at', { ascending: false });

    console.log('Raw Supabase response:', { data, error });

    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No properties found in database');
      return [];
    }

    return data as Property[];

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
