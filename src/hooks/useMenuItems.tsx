import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { pizzas as fallbackPizzas, Pizza } from '@/data/menuData';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  prices: {
    small: number;
    medium: number;
    large: number;
    family: number;
  };
  popular?: boolean;
  available: boolean;
}

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const items: MenuItem[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image_url || '',
          category: item.category,
          prices: {
            small: Number(item.price_small),
            medium: Number(item.price_medium),
            large: Number(item.price_large),
            family: Number(item.price_family),
          },
          popular: item.is_popular,
          available: item.is_available,
        }));
        setMenuItems(items);
      } else {
        // Use fallback data if no items in database
        const fallbackItems: MenuItem[] = fallbackPizzas.map(pizza => ({
          ...pizza,
          available: true,
        }));
        setMenuItems(fallbackItems);
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err as Error);
      // Use fallback data on error
      const fallbackItems: MenuItem[] = fallbackPizzas.map(pizza => ({
        ...pizza,
        available: true,
      }));
      setMenuItems(fallbackItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Convert to Pizza format for backward compatibility
  const pizzas: Pizza[] = menuItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    image: item.image,
    category: item.category,
    prices: item.prices,
    popular: item.popular,
  }));

  return {
    menuItems,
    pizzas,
    loading,
    error,
    refetch: fetchMenuItems,
  };
};
