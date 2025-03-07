const PATMA_API_KEY = '3160af39c66686f66e595371584faa9d8087132c';
const PATMA_API_URL = 'https://api.patma.co.uk';

export interface PatmaProperty {
  id: string;
  title: string;
  price: number;
  description: string;
  location: {
    address: string;
    postcode: string;
    city: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    receptionRooms: number;
    propertyType: string;
    tenure: string;
  };
  images: string[];
  floorArea: {
    size: number;
    unit: string;
  };
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  listingUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  location?: string;
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
  properties: PatmaProperty[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AskingPriceResponse {
  status: string;
  response_time: number;
  data: {
    data_points: number;
    radius: number;
    mean: number;
    median: number;
  };
  postcode: string;
  lat: number;
  long: number;
  bedrooms: number;
  property_type: string;
}

export interface AskingPriceParams {
  postcode: string;
  lat?: number;
  long?: number;
  bedrooms?: number;
  property_type?: 'flat' | 'terraced' | 'semi-detached' | 'detached';
  min_data_points?: number;
}

export interface SoldProperty {
  id: string;
  address: string;
  postcode: string;
  price: number;
  date_of_transfer: string;
  property_type: string;
  old_new: string;
  duration: string;
  bedrooms?: number;
  floor_area?: number;
}

export interface ListedProperty {
  id: string;
  address: string;
  postcode: string;
  price: number;
  date_listed: string;
  property_type: string;
  bedrooms: number;
  description: string;
  images: string[];
  agent: {
    name: string;
    phone: string;
  };
}

export interface PriceHistory {
  property_id: string;
  price_changes: Array<{
    date: string;
    price: number;
    type: 'reduction' | 'increase' | 'initial';
  }>;
}

export interface SoldPricesParams {
  postcode: string;
  lat?: number;
  long?: number;
  property_type: 'flat' | 'terraced' | 'semi-detached' | 'detached' | 'bungalow';
  tenure?: 'freehold' | 'leasehold';
  new_build?: 'true' | 'false';
  max_age_months?: number;
  min_data_points?: number;
  apply_indexation?: boolean;
}

export interface PriceHistoryParams {
  postcode: string;
  property_type?: 'flat' | 'terraced' | 'semi-detached' | 'detached';
}

export interface ListPropertyParams {
  postcode: string;
  lat?: number;
  long?: number;
  radius?: number;
  polygon?: {
    coordinates: number[][][];
    type: 'Polygon';
  };
  property_type?: 'flat' | 'terraced' | 'semi-detached' | 'detached';
  bedrooms?: number;
  require_sold_price?: boolean;
  require_size?: boolean;
  include_sold_history?: boolean;
  include_indexation_based_value?: boolean;
  sort_by?: 'most_recent_sale_date' | 'distance';
  page?: number;
  page_size?: number;
  records_after?: string; // Format: DD/MM/YYYY
}

export async function searchProperties(filters: SearchFilters): Promise<SearchResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.minBeds) queryParams.append('minBeds', filters.minBeds.toString());
    if (filters.maxBeds) queryParams.append('maxBeds', filters.maxBeds.toString());
    if (filters.propertyType) queryParams.append('propertyType', filters.propertyType);
    if (filters.radius) queryParams.append('radius', filters.radius.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${PATMA_API_URL}/properties/search?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${PATMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch properties');
    }

    const data = await response.json();
    return {
      properties: data.properties,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
}

export async function getPropertyDetails(propertyId: string): Promise<PatmaProperty> {
  try {
    const response = await fetch(`${PATMA_API_URL}/properties/${propertyId}`, {
      headers: {
        'Authorization': `Bearer ${PATMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch property details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
}

export async function getAskingPrices(params: AskingPriceParams): Promise<AskingPriceResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add optional parameters if they exist
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.long) queryParams.append('long', params.long.toString());
    if (params.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.min_data_points) queryParams.append('min_data_points', params.min_data_points.toString());

    const response = await fetch(
      `${PATMA_API_URL}/api/prospector/v1/asking-prices/${encodeURIComponent(params.postcode)}?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${PATMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch asking prices');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching asking prices:', error);
    throw error;
  }
}

// Get sold properties in an area
export async function getSoldProperties(params: SoldPricesParams) {
  try {
    const queryParams = new URLSearchParams();
    
    // Add parameters according to API spec
    if (params.postcode) queryParams.append('postcode', params.postcode);
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.long) queryParams.append('long', params.long.toString());
    queryParams.append('property_type', params.property_type);
    if (params.tenure) queryParams.append('tenure', params.tenure);
    if (params.new_build) queryParams.append('new_build', params.new_build);
    if (params.max_age_months) queryParams.append('max_age_months', params.max_age_months.toString());
    if (params.min_data_points) queryParams.append('min_data_points', params.min_data_points.toString());
    if (params.apply_indexation !== undefined) queryParams.append('apply_indexation', params.apply_indexation.toString());

    const url = `${PATMA_API_URL}/api/prospector/v1/sold-prices/?${queryParams.toString()}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PATMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ errors: ['Unknown error occurred'] }));
      throw new Error(errorData.errors?.[0] || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.errors?.[0] || 'API returned error status');
    }

    return {
      properties: data.data?.available_results || [],
      total: data.data?.total_results_count || 0,
      totalPages: data.data?.number_of_pages || 1,
    };
  } catch (error) {
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    throw error;
  }
}

// Get currently listed properties
export async function getListedProperties(params: ListPropertyParams) {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all parameters according to API spec
    if (params.postcode) queryParams.append('postcode', params.postcode);
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.long) queryParams.append('long', params.long.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.polygon) queryParams.append('polygon', JSON.stringify(params.polygon));
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params.require_sold_price !== undefined) queryParams.append('require_sold_price', params.require_sold_price.toString());
    if (params.require_size !== undefined) queryParams.append('require_size', params.require_size.toString());
    if (params.include_sold_history !== undefined) queryParams.append('include_sold_history', params.include_sold_history.toString());
    if (params.include_indexation_based_value !== undefined) queryParams.append('include_indexation_based_value', params.include_indexation_based_value.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.records_after) queryParams.append('records_after', params.records_after);

    const url = `${PATMA_API_URL}/api/prospector/v1/list-property/?${queryParams.toString()}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PATMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ errors: ['Unknown error occurred'] }));
      throw new Error(errorData.errors?.[0] || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.errors?.[0] || 'API returned error status');
    }

    return {
      properties: data.data?.available_results || [],
      total: data.data?.total_results_count || 0,
      totalPages: data.data?.number_of_pages || 1,
    };
  } catch (error) {
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    throw error;
  }
}

// Get price history for a property
export async function getPriceHistory(params: PriceHistoryParams) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.property_type) queryParams.append('property_type', params.property_type);

    const response = await fetch(
      `${PATMA_API_URL}/api/prospector/v1/price-history/${encodeURIComponent(params.postcode)}?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${PATMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch price history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
} 