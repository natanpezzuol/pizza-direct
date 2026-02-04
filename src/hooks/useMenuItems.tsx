import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { pizzas as fallbackPizzas, Pizza, categories as fallbackCategories, Category } from '@/data/menuData';

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

// Map category IDs to display names and icons
const categoryDisplayMap: Record<string, { name: string; icon: string }> = {
  'tradicional': { name: 'Tradicionais', icon: '🧀' },
  'especial': { name: 'Especiais', icon: '⭐' },
  'premium': { name: 'Premium', icon: '👑' },
  'doce': { name: 'Doces', icon: '🍫' },
};

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

    // Subscribe to realtime changes
    const channel = supabase
      .channel('menu_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
        },
        (payload) => {
          console.log('Menu items changed:', payload);
          fetchMenuItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  // Generate dynamic categories based on menu items
  const categories: Category[] = useMemo(() => {
    if (menuItems.length === 0) {
      return fallbackCategories;
    }

    // Get unique categories from menu items
    const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
    
    // Build categories array with "all" first
    const dynamicCategories: Category[] = [
      { id: 'all', name: 'Todas', icon: '🍕' },
    ];

    uniqueCategories.forEach(categoryId => {
      const display = categoryDisplayMap[categoryId] || { 
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1), 
        icon: '🍕' 
      };
      dynamicCategories.push({
        id: categoryId,
        name: display.name,
        icon: display.icon,
      });
    });

    return dynamicCategories;
  }, [menuItems]);

  return {
    menuItems,
    pizzas,
    categories,
    loading,
    error,
    refetch: fetchMenuItems,
  };
};
