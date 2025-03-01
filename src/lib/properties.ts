import { supabase } from "./supabase";
import type { Property, SavedProperty } from "../types/database";
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface Property {
  id: string;
  address: string;
  price: number;
  bedroom: number;
  bathroom: number;
  images: string[];
  description: string;
  property_type: string;
  created_at: string;
  city: string;
  postcode: string;
  square_footage: number;
  is_premium: boolean;
}

export const getFeaturedProperties = async (page = 1, limit = 6) => {
  const start = (page - 1) * limit;
  
  console.log('Fetching properties:', { page, limit, start });
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .range(start, start + limit - 1)
    .order('created_at', { ascending: false });

  console.log('Supabase response:', { data, error });

  if (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }

  return data || [];
};

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
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .or(`address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,postcode.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  return data || [];
}

export async function getProperty(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Property;
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
