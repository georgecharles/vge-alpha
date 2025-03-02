import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // You'll need to create this
import PropertyCard from './PropertyCard';

interface Property {
  id: string;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  image_url: string;
  is_featured: boolean;
}

export default function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched properties:', data);

      if (data) {
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading properties...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (properties.length === 0) {
    return <div>No featured properties found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          id={property.id}
          address={property.location}
          price={property.price}
          squareFootage={property.sqft}
          bedrooms={property.beds}
          bathrooms={property.baths}
          isPremium={property.is_featured}
          propertyType="residential" // You might want to add this to your database if needed
          description={property.description}
          createdAt={property.created_at}
          images={property.image_url ? [property.image_url] : []}
          onClick={() => {
            // Handle property click - e.g., navigate to property detail page
            console.log(`Clicked property ${property.id}`);
          }}
        />
      ))}
    </div>
  );
} 