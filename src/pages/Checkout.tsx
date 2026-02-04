import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Smartphone, QrCode, Check } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationsContext';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';

interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement: string | null;
  city: string;
  phone: string;
}

type PaymentMethod = 'credit_online' | 'card_delivery' | 'pix';

const paymentOptions = [
  {
    id: 'credit_online' as PaymentMethod,
    name: 'Cartão de Crédito',
    description: 'Pagamento online com cartão de crédito',
    icon: CreditCard,
  },
  {
    id: 'card_delivery' as PaymentMethod,
    name: 'Cartão de Crédito ou Débito na Entrega',
    description: 'Pagamento na entrega com maquininha',
    icon: Smartphone,
  },
  {
    id: 'pix' as PaymentMethod,
    name: 'PIX',
    description: 'Pagamento instantâneo via PIX',
    icon: QrCode,
  },
];

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const pizzeria = usePizzeria();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);

  // Get address ID from cart navigation state
  const addressIdFromCart = (location.state as { addressId?: string })?.addressId;

  const subtotal = totalPrice;
  const deliveryFee = pizzeria.deliveryFee;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    
    if (user) {
      fetchAddress();
    }
  }, [user, items, addressIdFromCart]);

  const fetchAddress = async () => {
    if (!user) return;

    // If we have an address ID from cart, fetch that specific address
    if (addressIdFromCart) {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressIdFromCart)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSelectedAddress(data);
        return;
      }
    }

    // Fallback to default address
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSelectedAddress(data);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedPayment) {
      toast({
        title: 'Selecione uma forma de pagamento',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedAddress) {
      toast({
        title: 'Endereço não encontrado',
        description: 'Cadastre um endereço de entrega',
        variant: 'destructive',
      });
      navigate('/addresses');
      return;
    }

    if (!user) {
      toast({
        title: 'Faça login para continuar',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      // Fetch user profile for customer info
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .maybeSingle();

      const customerName = profile?.name || user.email?.split('@')[0] || 'Cliente';
      const customerPhone = selectedAddress.phone || profile?.phone || '';

      const deliveryAddressStr = `${selectedAddress.street}, ${selectedAddress.number}${selectedAddress.complement ? ` - ${selectedAddress.complement}` : ''}, ${selectedAddress.city}`;

      // Insert order with 'received' status - only changes to 'preparing' when admin accepts
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddressStr,
          items: items.map(item => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            flavors: item.flavors,
            crust: item.crust,
            extras: item.extras,
            notes: item.notes,
          })),
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total: total,
          status: 'received', // Starts as 'received', admin accepts to move to 'preparing'
          payment_method: selectedPayment,
        });

      if (error) throw error;

      // Add notification
      addNotification({
        title: 'Pedido enviado! 🎉',
        description: `Seu pedido de R$ ${total.toFixed(2)} foi recebido e aguarda confirmação.`,
        type: 'success',
      });

      toast({
        title: 'Pedido realizado com sucesso!',
        description: 'Aguarde a confirmação da pizzaria',
      });

      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Erro ao criar pedido',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/cart" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft size={24} className="text-foreground" />
            </Link>
            <h1 className="font-display font-bold text-xl text-foreground">
              Pagamento
            </h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <section className="bg-card rounded-2xl p-4 shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-3">
            Resumo do Pedido
          </h2>
          <div className="space-y-2 text-sm">
            {items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.name} ({item.size})
                </span>
                <span className="text-foreground">R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de entrega</span>
              <span className="text-foreground">R$ {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span className="text-foreground">Total</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Delivery Address */}
        {selectedAddress && (
          <section className="bg-card rounded-2xl p-4 shadow-card">
            <h2 className="font-display font-semibold text-foreground mb-2">
              📍 Entregar em
            </h2>
            <p className="text-foreground">
              {selectedAddress.street}, {selectedAddress.number}
              {selectedAddress.complement && ` - ${selectedAddress.complement}`}
            </p>
            <p className="text-muted-foreground text-sm">{selectedAddress.city}</p>
            <p className="text-muted-foreground text-sm mt-1">📞 {selectedAddress.phone}</p>
          </section>
        )}

        {/* Payment Options */}
        <section>
          <h2 className="font-display font-semibold text-foreground mb-4">
            💳 Forma de Pagamento
          </h2>
          <div className="space-y-3">
            {paymentOptions.map((option, index) => {
              const isSelected = selectedPayment === option.id;
              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedPayment(option.id)}
                  className={`
                    w-full p-4 rounded-2xl border-2 transition-all text-left
                    ${isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${isSelected ? 'bg-primary/10' : 'bg-secondary'}
                    `}>
                      <option.icon size={24} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {option.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
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
          </div>
        </section>
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t safe-area-bottom">
        <Button
          onClick={handleConfirmOrder}
          disabled={loading || !selectedPayment}
          className="w-full h-14 gradient-hero text-primary-foreground font-bold text-lg rounded-xl shadow-glow disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
              Processando...
            </div>
          ) : (
            `Confirmar Pedido • R$ ${total.toFixed(2)}`
          )}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Checkout;
