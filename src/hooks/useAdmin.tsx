import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PizzeriaSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  opening_hours: string;
  delivery_time: string;
  minimum_order: number;
  delivery_fee: number;
  primary_color: string;
  is_open: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  category: string;
  price_small: number;
  price_medium: number;
  price_large: number;
  price_family: number;
  is_popular: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  rating?: {
    rating: number;
    comment: string | null;
    created_at: string;
  };
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PizzeriaSettings | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch pizzeria settings
  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pizzeria_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings({
          ...data,
          minimum_order: Number(data.minimum_order),
          delivery_fee: Number(data.delivery_fee),
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  // Update pizzeria settings
  const updateSettings = async (newSettings: Partial<PizzeriaSettings>) => {
    if (!settings) return { error: new Error('No settings found') };

    try {
      const { error } = await supabase
        .from('pizzeria_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) throw error;
      await fetchSettings();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) {
        setMenuItems(data.map(item => ({
          ...item,
          price_small: Number(item.price_small),
          price_medium: Number(item.price_medium),
          price_large: Number(item.price_large),
          price_family: Number(item.price_family),
        })));
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  }, []);

  // Add menu item
  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .insert([item]);

      if (error) throw error;
      await fetchMenuItems();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Update menu item
  const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(item)
        .eq('id', id);

      if (error) throw error;
      await fetchMenuItems();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Delete menu item
  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchMenuItems();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch all ratings
      const { data: ratingsData } = await supabase
        .from('order_ratings')
        .select('order_id, rating, comment, created_at');

      // Create a map of order_id to rating
      const ratingsMap = new Map(
        ratingsData?.map(r => [r.order_id, { rating: r.rating, comment: r.comment, created_at: r.created_at }]) || []
      );

      if (ordersData) {
        setOrders(ordersData.map(order => ({
          ...order,
          subtotal: Number(order.subtotal),
          delivery_fee: Number(order.delivery_fee),
          total: Number(order.total),
          items: order.items as any[],
          rating: ratingsMap.get(order.id),
        })));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, [isAdmin]);

  // Realtime subscription for orders
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchOrders]);

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    fetchSettings();
    fetchMenuItems();
  }, [fetchSettings, fetchMenuItems]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, fetchOrders]);

  return {
    isAdmin,
    loading,
    settings,
    menuItems,
    orders,
    updateSettings,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    fetchOrders,
    updateOrderStatus,
    refetchSettings: fetchSettings,
    refetchMenuItems: fetchMenuItems,
  };
};
