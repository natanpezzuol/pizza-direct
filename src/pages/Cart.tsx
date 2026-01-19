import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import CartItemComponent from '@/components/CartItem';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { items, totalPrice, clearCart } = useCart();
  const pizzeria = usePizzeria();
  const navigate = useNavigate();

  const subtotal = totalPrice;
  const deliveryFee = pizzeria.deliveryFee;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    // Navigate to order tracking (simulating order placement)
    navigate('/orders');
  };

  if (items.length === 0) {
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
                Carrinho
              </h1>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center px-4 py-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6"
          >
            <ShoppingBag size={40} className="text-muted-foreground" />
          </motion.div>
          <h2 className="font-display font-bold text-xl text-foreground mb-2">
            Seu carrinho está vazio
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Adicione itens deliciosos do nosso cardápio!
          </p>
          <Link to="/">
            <Button className="gradient-hero text-primary-foreground font-bold px-8 rounded-xl shadow-glow">
              Ver Cardápio
            </Button>
          </Link>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft size={24} className="text-foreground" />
              </Link>
              <h1 className="font-display font-bold text-xl text-foreground">
                Carrinho ({items.length})
              </h1>
            </div>
            <button
              onClick={clearCart}
              className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={20} className="text-destructive" />
            </button>
          </div>
        </div>
      </header>

      {/* Items */}
      <div className="px-4 py-4 space-y-3">
        {items.map((item, index) => (
          <CartItemComponent key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Summary */}
      <div className="px-4 py-4">
        <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
          <div className="flex justify-between text-foreground">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-foreground">
            <span>Taxa de entrega</span>
            <span>R$ {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between font-bold text-lg text-foreground">
            <span>Total</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t safe-area-bottom">
        <Button
          onClick={handleCheckout}
          className="w-full h-14 gradient-hero text-primary-foreground font-bold text-lg rounded-xl shadow-glow"
        >
          Finalizar Pedido • R$ {total.toFixed(2)}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Cart;
