import { PATMA_API_KEY } from '@/config';

const API_BASE_URL = 'https://app.patma.co.uk';
const API_PATH = '/api/prospector/v1';

// Common types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  response_time: number;
  data: T;
}

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
  id?: string;
  address: string;
  postcode: string;
  price?: number;
  sale_price?: number;
  date_of_transfer: string;
  property_type: string;
  old_new?: string;
  duration?: string;
  bedrooms?: number;
  floor_area?: number;
  floor_area_units?: string;
  latitude?: number;
  longitude?: number;
  distance_miles?: number;
  tenure?: string;
  new_build?: boolean;
  indexation_adjusted_price?: number;
  // Investment metrics
  estimated_rent?: number;
  rental_yield?: number;
  roi?: number;
  estimated_growth?: number;
}

export interface ListedProperty {
  id?: string;
  address: string;
  postcode: string;
  price?: number;
  asking_price?: number;
  date_listed?: string;
  property_type: string;
  bedrooms?: number;
  description?: string;
  images?: string[];
  image_url?: string;
  agent?: {
    name: string;
    phone: string;
  };
  tenure?: string;
  new_build?: boolean;
  floor_area?: number;
  floor_area_units?: string;
  latitude?: number;
  longitude?: number;
  distance_miles?: number;
  most_recent_sale_date?: string;
  most_recent_sale_price?: number;
  // Investment metrics
  estimated_rent?: number;
  rental_yield?: number;
  roi?: number;
  estimated_growth?: number;
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
  location?: string;
  lat?: number;
  long?: number;
  property_type: 'flat' | 'terraced' | 'semi-detached' | 'detached' | 'bungalow';
  tenure?: 'freehold' | 'leasehold';
  new_build?: 'true' | 'false';
  max_age_months?: number;
  min_data_points?: number;
  apply_indexation?: boolean;
  page?: number;
  page_size?: number;
  radius?: number;
}

export interface PriceHistoryParams {
  postcode: string;
  property_type?: 'flat' | 'terraced' | 'semi-detached' | 'detached';
}

export interface ListPropertyParams {
  postcode: string;
  location?: string;
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

export interface PriceHistoryResponse {
  status: string;
  response_time: number;
  data: {
    trend_percentage: number;
    data_points: Array<{
      date: string;
      price: number;
    }>;
  };
}

interface ApiError {
  message: string;
  status?: number;
}

const handleApiError = (error: any): never => {
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    throw new Error('Unable to connect to the API. Please check your internet connection and try again.');
  }
  
  const apiError: ApiError = {
    message: error.message || 'An unexpected error occurred',
    status: error.status
  };

  if (error.response) {
    apiError.status = error.response.status;
    apiError.message = error.response.data?.message || error.message;
  }

  throw apiError;
};

const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PATMA_API_KEY}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw { status: response.status, message: error.message };
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// API functions
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

    const response = await fetch(`${API_BASE_URL}/properties/search?${queryParams.toString()}`, {
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
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
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
    
    // Add all parameters to query params
    queryParams.append('postcode', params.postcode);
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.long) queryParams.append('long', params.long.toString());
    if (params.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.min_data_points) queryParams.append('min_data_points', params.min_data_points.toString());

    const url = `${API_BASE_URL}${API_PATH}/asking-prices/?${queryParams.toString()}`;
    console.log('Fetching asking prices from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PATMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

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
    queryParams.append('postcode', params.postcode);
    if (params.location) queryParams.append('location', params.location);
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.long) queryParams.append('long', params.long.toString());
    queryParams.append('property_type', params.property_type);
    if (params.tenure) queryParams.append('tenure', params.tenure);
    if (params.new_build) queryParams.append('new_build', params.new_build);
    if (params.max_age_months) queryParams.append('max_age_months', params.max_age_months.toString());
    if (params.min_data_points) queryParams.append('min_data_points', params.min_data_points.toString());
    if (params.apply_indexation !== undefined) queryParams.append('apply_indexation', params.apply_indexation.toString());

    const url = `${API_BASE_URL}${API_PATH}/sold-prices/?${queryParams.toString()}`;
    console.log('Fetching sold properties from:', url);

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
    console.log('Sold properties response:', data);
    
    // Check if the response contains errors
    if (data.status === 'error' || data.errors) {
      const errorMessage = Array.isArray(data.errors) 
        ? data.errors[0] 
        : data.message || 'Failed to fetch sold properties';
      throw new Error(errorMessage);
    }

    // Check for the specific response structure we're seeing (same as listed properties)
    if (data && data.data && Array.isArray(data.data.available_results)) {
      return {
        properties: data.data.available_results,
        total: data.data.total_results_count || data.data.available_results.length,
        totalPages: data.data.number_of_pages || Math.ceil(data.data.total_results_count / (params.page_size || 12))
      };
    }
    
    // Check if data exists and has the expected structure
    if (data && data.data && Array.isArray(data.data.properties)) {
      return {
        properties: data.data.properties,
        total: data.data.total || data.data.properties.length,
        totalPages: data.data.total_pages || Math.ceil(data.data.properties.length / (params.page_size || 10))
      };
    }
    
    // Return empty result if no data
    console.warn('Unexpected API response structure for sold properties:', data);
    return { properties: [], total: 0, totalPages: 1 };
  } catch (error) {
    console.error('Error fetching sold properties:', error);
    throw error;
  }
}

// Get currently listed properties
export async function getListedProperties(params: ListPropertyParams) {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all parameters according to API spec
    queryParams.append('postcode', params.postcode);
    if (params.location) queryParams.append('location', params.location);
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

    const url = `${API_BASE_URL}${API_PATH}/list-property/?${queryParams.toString()}`;
    console.log('Fetching listed properties from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PATMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    const data = await response.json();
    console.log('Listed properties response:', data);

    // Check if the response contains errors
    if (data.status === 'error' || data.errors) {
      const errorMessage = Array.isArray(data.errors) 
        ? data.errors[0] 
        : data.message || 'Failed to fetch listed properties';
      throw new Error(errorMessage);
    }

    // Check for the specific response structure we're seeing
    if (data && data.data && Array.isArray(data.data.available_results)) {
      return {
        properties: data.data.available_results,
        total: data.data.total_results_count || data.data.available_results.length,
        totalPages: data.data.number_of_pages || Math.ceil(data.data.total_results_count / (params.page_size || 12))
      };
    }

    // Check if data exists and has the expected structure
    if (data && data.properties) {
      return {
        properties: data.properties || [],
        total: data.total || data.properties?.length || 0,
        totalPages: data.total_pages || Math.ceil((data.properties?.length || 0) / (params.page_size || 10))
      };
    }

    // If we have data but no properties array, check for nested data structure
    if (data && data.data && data.data.properties) {
      return {
        properties: data.data.properties,
        total: data.data.total || data.data.properties.length,
        totalPages: data.data.total_pages || Math.ceil(data.data.properties.length / (params.page_size || 10))
      };
    }
    
    // Return empty result if no valid data structure found
    console.warn('Unexpected API response structure:', data);
    return { properties: [], total: 0, totalPages: 1 };
  } catch (error) {
    console.error('Error fetching listed properties:', error);
    throw error;
  }
}

// Get price history for a property
export async function getPriceHistory(params: PriceHistoryParams) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('postcode', params.postcode);
    if (params.property_type) queryParams.append('property_type', params.property_type);

    const url = `${API_BASE_URL}${API_PATH}/price-history/?${queryParams.toString()}`;
    console.log('Fetching price history from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${PATMA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch price history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
} 