import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { DealCard } from './DealCard';
import { PropertyCard } from './PropertyCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function SavedItems() {
  const { user } = useAuth();
  const [savedDeals, setSavedDeals] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSavedItems = async () => {
      try {
        const { data: savedItems, error } = await supabase
          .from('saved_items')
          .select(`
            item_id,
            item_type,
            deals:deals(*)
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        const deals = savedItems
          .filter(item => item.item_type === 'deal' && item.deals)
          .map(item => item.deals);

        setSavedDeals(deals);
        // Similar for properties
      } catch (error) {
        console.error('Error fetching saved items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedItems();
  }, [user]);

  return (
    <Tabs defaultValue="deals">
      <TabsList>
        <TabsTrigger value="deals">Saved Deals</TabsTrigger>
        <TabsTrigger value="properties">Saved Properties</TabsTrigger>
      </TabsList>
      <TabsContent value="deals">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedDeals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </TabsContent>
      <TabsContent value="properties">
        {/* Similar grid for properties */}
      </TabsContent>
    </Tabs>
  );
} 