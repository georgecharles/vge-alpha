import { supabase } from "./supabaseClient";

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

export const getDeals = async (page = 1, limit = 6) => {
  try {
    const start = (page - 1) * limit;
    
    console.log('Fetching deals with params:', { page, limit, start });
    
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
      .range(start, start + limit - 1)
      .order('created_at', { ascending: false });

    console.log('Raw Supabase response:', { data, error });

    if (error) {
      console.error('Supabase query error:', error.message, error);
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('No deals found in database');
      return [];
    }

    // Transform the data to match our Deal interface
    const transformedData = data.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      location: deal.location,
      price: Number(deal.price),
      roi_percentage: Number(deal.roi_percentage),
      investment_term: deal.investment_term,
      property_type: deal.property_type,
      deal_type: deal.deal_type,
      image_url: deal.image_url,
      created_at: deal.created_at,
      updated_at: deal.updated_at
    }));

    console.log('Transformed deals:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error in getDeals:', error instanceof Error ? error.message : error);
    throw error;
  }
};

export const searchDeals = async (searchTerm: string): Promise<Deal[]> => {
  console.log('Searching deals with term:', searchTerm);
  const term = searchTerm.toLowerCase().trim();

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
    .or(
      `title.ilike.%${term}%,` +
      `description.ilike.%${term}%,` +
      `location.ilike.%${term}%,` +
      `property_type.ilike.%${term}%,` +
      `deal_type.ilike.%${term}%`
    )
    .order('created_at', { ascending: false });

    console.log('Search response:', { data, error });

    if (error) {
      console.error('Error searching deals:', error);
      return [];
    }

    return data.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      location: deal.location,
      price: Number(deal.price),
      roi_percentage: Number(deal.roi_percentage),
      investment_term: deal.investment_term,
      property_type: deal.property_type,
      deal_type: deal.deal_type,
      image_url: deal.image_url,
      created_at: deal.created_at,
      updated_at: deal.updated_at
    }));
};

export const getDeal = async (id: string): Promise<Deal | null> => {
  try {
    // First verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    console.log('Fetching deal:', id);

    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        author:profiles!deals_created_by_fkey(full_name)
      `)
      .eq('id', id)
      .single();

    console.log('Deal fetch result:', { deal, error });

    if (error) {
      console.error('Error fetching deal:', error);
      return null;
    }

    if (!deal) return null;

    // Transform the data
    return {
      ...deal,
      images: Array.isArray(deal.images) ? deal.images : [deal.images].filter(Boolean),
      location: typeof deal.location === 'string' ? JSON.parse(deal.location) : (deal.location || {}),
      key_features: Array.isArray(deal.key_features) ? deal.key_features : [],
      sensitive_info: deal.sensitive_info
    };
  } catch (error) {
    console.error('Error fetching deal:', error);
    return null;
  }
}; 