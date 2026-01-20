import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import OrderTracker from '@/components/OrderTracker';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';

const Orders = () => {
  const { user, loading } = useAuth();
  
  // Mock order data - in real app, this would come from backend
  const hasActiveOrder = true;

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
        {hasActiveOrder ? (
          <div className="space-y-6">
            {/* Active Order */}
            <section>
              <h2 className="font-display font-semibold text-foreground mb-4">
                🔴 Pedido em Andamento
              </h2>
              <OrderTracker status="preparing" estimatedTime="25 min" />
            </section>

            {/* Order Details */}
            <section className="bg-card rounded-2xl p-4 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-3">
                Itens do Pedido
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">1x Pizza Margherita</p>
                    <p className="text-sm text-muted-foreground">Grande • Borda Catupiry</p>
                  </div>
                  <span className="font-medium text-foreground">R$ 60,00</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span className="text-foreground">R$ 5,99</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">R$ 65,99</span>
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="bg-card rounded-2xl p-4 shadow-card">
              <h3 className="font-display font-semibold text-foreground mb-2">
                📍 Endereço de Entrega
              </h3>
              <p className="text-muted-foreground">
                Rua Exemplo, 123 - Apt 45<br />
                Centro - São Paulo, SP
              </p>
            </section>
          </div>
        ) : (
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
        )}

        {/* Order History */}
        <section className="mt-8">
          <h2 className="font-display font-semibold text-foreground mb-4">
            📋 Histórico de Pedidos
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-4 shadow-card"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-foreground">Pedido #{1234 - index}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(Date.now() - (index + 1) * 86400000).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                    Entregue
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  2x Pizza Calabresa, 1x Pizza Margherita
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">R$ 125,99</span>
                  <button className="text-sm font-medium text-primary hover:underline">
                    Repetir pedido
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
};

export default Orders;
