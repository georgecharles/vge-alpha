import { supabase } from "./supabase";

export interface Deal {
  id: string;
  title: string;
  description: string;
  type: 'bmv' | 'development' | 'flip' | 'rental';
  status: 'available' | 'sold' | 'under offer';
  original_price: number;
  deal_price: number;
  potential_profit: number;
  roi_percentage: number;
  is_premium: boolean;
  images: string[];
  location: {
    address?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  key_features: string[];
  created_at: string;
  sensitive_info?: string;
}

export const getDeals = async (page = 1, limit = 6) => {
  try {
    // First verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get user's profile to check subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const start = (page - 1) * limit;
    
    console.log('Fetching deals:', { page, limit, start });

    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        author:profiles!deals_created_by_fkey(full_name)
      `)
      .range(start, start + limit - 1)
      .order('created_at', { ascending: false });

    console.log('Supabase deals response:', { data, error });

    if (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }

    // Filter deals based on subscription tier
    const transformedData = data.map(deal => ({
      ...deal,
      // Only show sensitive info to paid subscribers
      sensitive_info: profile?.subscription_tier !== 'free' ? deal.sensitive_info : null
    }));

    return transformedData;
  } catch (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
};

export const searchDeals = async (searchTerm: string): Promise<Deal[]> => {
  console.log('Searching deals with term:', searchTerm);
  const term = searchTerm.toLowerCase().trim();

  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .or(
      `title.ilike.%${term}%,` +
      `description.ilike.%${term}%,` +
      `type.ilike.%${term}%,` +
      `status.ilike.%${term}%`
    )
    .order('created_at', { ascending: false });

  console.log('Search response:', { data, error });

  if (error) {
    console.error('Error searching deals:', error);
    return [];
  }

  // Transform and filter the data to include location search
  const transformedDeals = (data || [])
    .map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      type: deal.type,
      status: deal.status,
      original_price: deal.original_price,
      deal_price: deal.deal_price,
      potential_profit: deal.potential_profit,
      roi_percentage: deal.roi_percentage,
      is_premium: deal.is_premium,
      images: Array.isArray(deal.images) ? deal.images : [deal.images].filter(Boolean),
      location: typeof deal.location === 'string' ? JSON.parse(deal.location) : (deal.location || {}),
      key_features: Array.isArray(deal.key_features) ? deal.key_features : [],
      created_at: deal.created_at
    }))
    .filter(deal => {
      // Additional client-side filtering for location and key features
      const locationStr = [
        deal.location?.address,
        deal.location?.city,
        deal.location?.postcode
      ].filter(Boolean).join(' ').toLowerCase();

      const keyFeaturesStr = deal.key_features.join(' ').toLowerCase();

      return (
        locationStr.includes(term) ||
        keyFeaturesStr.includes(term)
      );
    });

  console.log('Transformed deals:', transformedDeals);

  return transformedDeals;
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