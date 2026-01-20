import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, ShoppingBag, MapPin, ChevronRight, Check, Home, Briefcase, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import CartItemComponent from '@/components/CartItem';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Address {
  id: string;
  label: string;
  cep: string;
  street: string;
  city: string;
  number: string;
  complement: string | null;
  phone: string;
  is_default: boolean;
}

const labelIcons = {
  'Casa': Home,
  'Trabalho': Briefcase,
  'Outro': Heart,
} as const;

const Cart = () => {
  const { items, totalPrice, clearCart } = useCart();
  const pizzeria = usePizzeria();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setAddresses(data);
      // Select default address or first one
      const defaultAddress = data.find(a => a.is_default) || data[0];
      setSelectedAddressId(defaultAddress.id);
    }
    setLoading(false);
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setIsAddressDialogOpen(false);
  };

  const subtotal = totalPrice;
  const deliveryFee = pizzeria.deliveryFee;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (!selectedAddress) {
      setIsAddressDialogOpen(true);
      return;
    }
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

      {/* Delivery Address */}
      <div className="px-4 py-2">
        <button
          onClick={() => addresses.length > 0 ? setIsAddressDialogOpen(true) : navigate('/addresses')}
          className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center justify-between hover:shadow-elevated transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Entregar em</p>
              {loading ? (
                <div className="animate-pulse h-5 w-40 bg-secondary rounded" />
              ) : selectedAddress ? (
                <div>
                  <p className="font-medium text-foreground">
                    {selectedAddress.street}, {selectedAddress.number}
                    {selectedAddress.complement && ` - ${selectedAddress.complement}`}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedAddress.city}</p>
                </div>
              ) : (
                <p className="font-medium text-primary">Adicionar endereço</p>
              )}
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>
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

      {/* Address Selection Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha o endereço de entrega</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum endereço cadastrado</p>
                <Button
                  onClick={() => {
                    setIsAddressDialogOpen(false);
                    navigate('/addresses');
                  }}
                  className="gradient-hero text-primary-foreground"
                >
                  Adicionar Endereço
                </Button>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {addresses.map((address, index) => {
                    const LabelIcon = labelIcons[address.label] || Home;
                    const isSelected = selectedAddressId === address.id;
                    return (
                      <motion.button
                        key={address.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectAddress(address.id)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-primary/10' : 'bg-secondary'
                          }`}>
                            <LabelIcon size={20} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-foreground">{address.label}</span>
                              {address.is_default && (
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                  Padrão
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground">
                              {address.street}, {address.number}
                              {address.complement && ` - ${address.complement}`}
                            </p>
                            <p className="text-sm text-muted-foreground">{address.city}</p>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check size={14} className="text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddressDialogOpen(false);
                    navigate('/addresses');
                  }}
                  className="w-full mt-2"
                >
                  Gerenciar Endereços
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Cart;
