import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDeals } from './deals';
import { getProperties } from './properties';
import { getProfile } from './auth';

// Query keys
export const queryKeys = {
  deals: ['deals'] as const,
  properties: ['properties'] as const,
  profile: ['profile'] as const,
  featuredProperties: ['properties', 'featured'] as const,
};

// Deals query hook
export function useDeals() {
  return useQuery({
    queryKey: queryKeys.deals,
    queryFn: getDeals,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
  });
}

// Properties query hook
export function useProperties() {
  return useQuery({
    queryKey: queryKeys.properties,
    queryFn: getProperties,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
}

// Featured properties query hook
export function useFeaturedProperties() {
  return useQuery({
    queryKey: queryKeys.featuredProperties,
    queryFn: () => getProperties({ featured: true }),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
}

// Profile query hook
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.profile, userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
} 