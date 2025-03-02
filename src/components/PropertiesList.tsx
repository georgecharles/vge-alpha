import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PropertyCard from './PropertyCard';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  sqft: number;
  beds: number;
  baths: number;
  description: string;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
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
      console.log('Fetching properties...');
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Fetched data:', data);
      console.log('Error if any:', error);

      if (error) {
        throw error;
      }

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
    return <div>No properties found. Please add some properties to the database.</div>;
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
          propertyType="residential"
          description={property.description}
          createdAt={property.created_at}
          images={property.image_url ? [property.image_url] : []}
          onClick={() => {
            console.log('Clicked property:', property.id);
          }}
        />
      ))}
    </div>
  );
} 