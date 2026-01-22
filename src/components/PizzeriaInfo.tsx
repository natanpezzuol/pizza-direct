import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import { MapPin, Phone, Clock, Truck, DollarSign } from 'lucide-react';

interface PizzeriaInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const PizzeriaInfo = ({ isOpen, onClose }: PizzeriaInfoProps) => {
  const pizzeria = usePizzeria();

  const infoItems = [
    {
      icon: MapPin,
      label: 'Endereço',
      value: pizzeria.address,
    },
    {
      icon: Phone,
      label: 'Telefone',
      value: pizzeria.phone,
    },
    {
      icon: Clock,
      label: 'Horário de Funcionamento',
      value: pizzeria.openingHours,
    },
    {
      icon: Truck,
      label: 'Tempo de Entrega',
      value: pizzeria.deliveryTime,
    },
    {
      icon: DollarSign,
      label: 'Pedido Mínimo',
      value: `R$ ${pizzeria.minimumOrder.toFixed(2).replace('.', ',')}`,
    },
    {
      icon: Truck,
      label: 'Taxa de Entrega',
      value: `R$ ${pizzeria.deliveryFee.toFixed(2).replace('.', ',')}`,
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] md:h-auto md:max-h-[600px] rounded-t-3xl md:rounded-t-none">
        <SheetHeader className="text-center pb-4 border-b border-border">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl gradient-hero flex items-center justify-center shadow-glow mx-auto mb-3">
            <span className="text-3xl md:text-4xl">🍕</span>
          </div>
          <SheetTitle className="font-display text-xl md:text-2xl text-foreground">
            {pizzeria.name}
          </SheetTitle>
        </SheetHeader>

        <div className="py-4 md:py-6 space-y-3 md:space-y-4">
          {infoItems.map((item, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-secondary/50"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground mb-0.5">
                  {item.label}
                </p>
                <p className="text-sm md:text-base font-medium text-foreground">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <a
            href={`tel:${pizzeria.phone.replace(/\D/g, '')}`}
            className="w-full flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl gradient-hero text-primary-foreground font-semibold text-sm md:text-base shadow-glow active:scale-[0.98] transition-transform"
          >
            <Phone className="w-4 h-4 md:w-5 md:h-5" />
            Ligar Agora
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PizzeriaInfo;
