import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, Clock, Truck, DollarSign, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import BottomNav from '@/components/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const PizzeriaProfile = () => {
  const navigate = useNavigate();
  const pizzeria = usePizzeria();

  const openWhatsApp = () => {
    const phone = pizzeria.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}`, '_blank');
  };

  const openMaps = () => {
    const encodedAddress = encodeURIComponent(pizzeria.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (pizzeria.loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 glass-card border-b">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
        </header>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const infoItems = [
    {
      icon: Clock,
      label: 'Horário de Atendimento',
      value: pizzeria.openingHours,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: MapPin,
      label: 'Endereço',
      value: pizzeria.address,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      action: openMaps,
      actionLabel: 'Ver no mapa',
    },
    {
      icon: Phone,
      label: 'Telefone / WhatsApp',
      value: pizzeria.phone,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      action: openWhatsApp,
      actionLabel: 'Chamar no WhatsApp',
    },
    {
      icon: Truck,
      label: 'Tempo de Entrega',
      value: pizzeria.deliveryTime,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: DollarSign,
      label: 'Taxa de Entrega',
      value: `R$ ${pizzeria.deliveryFee.toFixed(2)}`,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-card border-b"
      >
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="font-display font-bold text-lg text-foreground">
            Sobre a Pizzaria
          </h1>
        </div>
      </motion.header>

      <main className="p-4 space-y-4">
        {/* Pizzeria Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 border shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-glow">
              <span className="text-3xl">🍕</span>
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-xl text-foreground">
                {pizzeria.name}
              </h2>
              <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                pizzeria.isOpen 
                  ? 'bg-green-500/10 text-green-600' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${pizzeria.isOpen ? 'bg-green-500' : 'bg-destructive'}`} />
                {pizzeria.isOpen ? 'Aberto agora' : 'Fechado'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="space-y-3">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-4 border shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${item.bgColor}`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-foreground break-words">
                    {item.value}
                  </p>
                  {item.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.action}
                      className="mt-2 h-8 px-3 text-xs text-primary hover:text-primary"
                    >
                      <ExternalLink size={14} className="mr-1.5" />
                      {item.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Minimum Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-secondary/50 rounded-2xl p-4 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Pedido mínimo: <span className="font-semibold text-foreground">R$ {pizzeria.minimumOrder.toFixed(2)}</span>
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default PizzeriaProfile;
