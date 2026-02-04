import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, MapPin } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import OrderTracker, { OrderStatus } from '@/components/OrderTracker';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
  flavors?: string[];
  crust?: string;
  extras?: string[];
  notes?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

const statusMap: Record<string, OrderStatus> = {
  received: 'received',
  pending: 'received',
  preparing: 'preparing',
  delivery: 'delivery',
  delivered: 'delivered',
};

const statusLabels: Record<string, string> = {
  received: 'Aguardando confirmação',
  pending: 'Aguardando confirmação',
  preparing: 'Em preparo',
  delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const Orders = () => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setOrders(data.map(order => ({
          ...order,
          subtotal: Number(order.subtotal),
          delivery_fee: Number(order.delivery_fee),
          total: Number(order.total),
          items: order.items as unknown as OrderItem[],
        })));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  // Realtime subscription for order status updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-orders-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchOrders]);

  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const activeOrder = activeOrders[0];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft size={24} className="text-foreground" />
            </Link>
            <h1 className="font-display font-bold text-xl text-foreground">
              Meus Pedidos
            </h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {loadingOrders ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activeOrder ? (
          <div className="space-y-6">
            {/* Active Order */}
            <section>
              <h2 className="font-display font-semibold text-foreground mb-4">
                🔴 Pedido em Andamento
              </h2>
              <OrderTracker 
                status={statusMap[activeOrder.status] || 'received'} 
                estimatedTime={activeOrder.status === 'preparing' ? '25 min' : activeOrder.status === 'delivery' ? '15 min' : undefined} 
              />
            </section>

            {/* Order Details */}
            <section className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-semibold text-foreground">
                  Itens do Pedido
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeOrder.status === 'received' ? 'bg-warning/10 text-warning' :
                  activeOrder.status === 'preparing' ? 'bg-primary/10 text-primary' :
                  activeOrder.status === 'delivery' ? 'bg-info/10 text-info' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {statusLabels[activeOrder.status] || activeOrder.status}
                </span>
              </div>
              <div className="space-y-3">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{item.quantity}x {item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size}
                        {item.crust && ` • ${item.crust}`}
                      </p>
                    </div>
                    <span className="font-medium text-foreground">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span className="text-foreground">R$ {activeOrder.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">R$ {activeOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="bg-card rounded-2xl p-4 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-2">
                📍 Endereço de Entrega
              </h3>
              <p className="text-foreground">{activeOrder.delivery_address}</p>
              {activeOrder.customer_phone && (
                <p className="text-sm text-muted-foreground mt-2">
                  📞 {activeOrder.customer_phone}
                </p>
              )}
            </section>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Package size={40} className="text-muted-foreground" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              Nenhum pedido ainda
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Que tal fazer seu primeiro pedido?
            </p>
            <Link 
              to="/"
              className="gradient-hero text-primary-foreground font-bold px-8 py-3 rounded-xl shadow-glow"
            >
              Ver Cardápio
            </Link>
          </motion.div>
        ) : null}

        {/* Order History */}
        {completedOrders.length > 0 && (
          <section className={activeOrder ? 'mt-8' : ''}>
            <h2 className="font-display font-semibold text-foreground mb-4">
              📋 Histórico de Pedidos
            </h2>
            <div className="space-y-3">
              {completedOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-4 shadow-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-foreground">Pedido #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered' ? 'bg-success/10 text-success' :
                      order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">R$ {order.total.toFixed(2)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Orders;