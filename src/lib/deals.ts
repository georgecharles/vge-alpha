import { supabase } from "./supabase";

export interface Deal {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  original_price: number;
  deal_price: number;
  potential_profit: number;
  roi_percentage: number;
  is_premium: boolean;
  images: string[] | string;
  location: {
    address?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  key_features: string[];
  created_at: string;
}

export const getDeals = async (page = 1, limit = 6) => {
  const start = (page - 1) * limit;
  
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .range(start, start + limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }

  // Transform the data to parse JSON strings
  const transformedData = data?.map(deal => ({
    ...deal,
    images: typeof deal.images === 'string' 
      ? JSON.parse(deal.images.replace(/\\/g, '')) // Remove escaped characters
      : deal.images
  }));

  console.log('Transformed data:', transformedData);

  return transformedData || [];
};

export const searchDeals = async (searchTerm: string): Promise<Deal[]> => {
  const { data: deals, error } = await supabase
    .from('deals')
    .select(`
      *,
      images
    `)
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching deals:', error);
    return [];
  }

  // Transform the data to match the expected format
  const transformedDeals = deals?.map(deal => ({
    ...deal,
    images: Array.isArray(deal.images) ? deal.images : [deal.images],
  })) || [];

  return transformedDeals;
};

export const getDeal = async (id: string): Promise<Deal | null> => {
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      images
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching deal:', error);
    return null;
  }

  if (!deal) return null;

  // Transform the data to match the expected format
  return {
    ...deal,
    images: Array.isArray(deal.images) ? deal.images : [deal.images],
  };
}; 