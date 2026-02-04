import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Check, ChevronDown } from 'lucide-react';
import { Pizza, sizes, crusts, extras } from '@/data/menuData';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Import pizza images
import pizzaMargherita from '@/assets/pizza-margherita.jpg';
import pizzaCalabresa from '@/assets/pizza-calabresa.jpg';
import pizzaQuatroQueijos from '@/assets/pizza-quatro-queijos.jpg';
import pizzaPortuguesa from '@/assets/pizza-portuguesa.jpg';
import pizzaFrango from '@/assets/pizza-frango.jpg';
import pizzaChocolate from '@/assets/pizza-chocolate.jpg';

const pizzaImages: Record<string, string> = {
  '1': pizzaMargherita,
  '2': pizzaCalabresa,
  '3': pizzaQuatroQueijos,
  '4': pizzaPortuguesa,
  '5': pizzaFrango,
  '6': pizzaCalabresa,
  '7': pizzaMargherita,
  '8': pizzaFrango,
  '9': pizzaChocolate,
  '10': pizzaChocolate,
};

interface PizzaCustomizerProps {
  pizza: Pizza;
  isOpen: boolean;
  onClose: () => void;
}

const PizzaCustomizer = ({ pizza, isOpen, onClose }: PizzaCustomizerProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { pizzas: availablePizzas } = useMenuItems();
  const [selectedSize, setSelectedSize] = useState('small');
  const [selectedCrust, setSelectedCrust] = useState('tradicional');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [wantsTwoFlavors, setWantsTwoFlavors] = useState(false);
  const [secondFlavor, setSecondFlavor] = useState<string>('');

  const image = pizzaImages[pizza.id] || pizzaMargherita;
  
  // Calculate base price - for 2 flavors, use the higher price of the two
  const firstPizzaPrice = pizza.prices[selectedSize as keyof typeof pizza.prices];
  const secondPizza = availablePizzas.find(p => p.id === secondFlavor);
  const secondPizzaPrice = secondPizza?.prices[selectedSize as keyof typeof pizza.prices] || 0;
  const basePrice = wantsTwoFlavors && secondFlavor 
    ? Math.max(firstPizzaPrice, secondPizzaPrice)
    : firstPizzaPrice;
  
  const crustPrice = crusts.find(c => c.id === selectedCrust)?.price || 0;
  const extrasPrice = selectedExtras.reduce((acc, extraId) => {
    const extra = extras.find(e => e.id === extraId);
    return acc + (extra?.price || 0);
  }, 0);
  
  const totalPrice = (basePrice + crustPrice + extrasPrice) * quantity;

  // Filter available pizzas for second flavor (exclude current pizza and match category for sweet pizzas)
  const availableSecondFlavors = availablePizzas.filter(p => {
    if (p.id === pizza.id) return false;
    // Sweet pizzas can only be combined with other sweet pizzas
    if (pizza.category === 'doce') return p.category === 'doce';
    // Non-sweet pizzas can only be combined with non-sweet
    return p.category !== 'doce';
  });

  const handleAddToCart = () => {
    if (!user) {
      onClose();
      navigate('/auth');
      return;
    }

    const flavors = [pizza.name];
    if (wantsTwoFlavors && secondFlavor) {
      const secondPizzaName = availablePizzas.find(p => p.id === secondFlavor)?.name;
      if (secondPizzaName) {
        flavors.push(secondPizzaName);
      }
    }
    
    addItem({
      id: '',
      name: wantsTwoFlavors && secondFlavor 
        ? `${pizza.name} / ${availablePizzas.find(p => p.id === secondFlavor)?.name}`
        : pizza.name,
      size: sizes.find(s => s.id === selectedSize)?.name || '',
      flavors,
      crust: crusts.find(c => c.id === selectedCrust)?.name || '',
      extras: selectedExtras.map(e => extras.find(ex => ex.id === e)?.name || ''),
      price: basePrice + crustPrice + extrasPrice,
      quantity,
      image,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(e => e !== extraId)
        : [...prev, extraId]
    );
  };

  const handleTwoFlavorsToggle = () => {
    setWantsTwoFlavors(prev => !prev);
    if (wantsTwoFlavors) {
      setSecondFlavor('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl sm:rounded-t-3xl z-50 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="sticky top-0 bg-background pt-2 sm:pt-3 pb-1.5 sm:pb-2 z-10">
              <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-muted rounded-full mx-auto" />
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center z-20 active:scale-95"
            >
              <X size={18} className="sm:w-5 sm:h-5 text-foreground" />
            </button>
            
            {/* Image */}
            <div className="relative h-36 sm:h-48 mx-3 sm:mx-4 rounded-xl sm:rounded-2xl overflow-hidden">
              <img 
                src={image} 
                alt={pizza.name}
                className="w-full h-full object-cover"
              />
              </div>

              {/* Two Flavors Option */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-display font-semibold text-sm sm:text-base text-foreground mb-2 sm:mb-3">
                  🍕 Quantos sabores?
                </h3>
                
                {/* Toggle options for 1 or 2 flavors */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* 1 Sabor */}
                  <button
                    onClick={() => { setWantsTwoFlavors(false); setSecondFlavor(''); }}
                    className={`
                      flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl 
                      border-2 transition-all active:scale-[0.98]
                      ${!wantsTwoFlavors 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card hover:border-primary/50'
                      }
                    `}
                  >
                    <div className={`
                      w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all mb-2
                      ${!wantsTwoFlavors 
                        ? 'gradient-hero border-transparent' 
                        : 'border-border'
                      }
                    `}>
                      {!wantsTwoFlavors && <Check size={12} className="sm:w-3.5 sm:h-3.5 text-primary-foreground" />}
                    </div>
                    <p className="font-bold text-sm sm:text-base text-foreground">1 Sabor</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      Pizza inteira
                    </p>
                  </button>

                  {/* 2 Sabores */}
                  <button
                    onClick={() => setWantsTwoFlavors(true)}
                    className={`
                      flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl 
                      border-2 transition-all active:scale-[0.98]
                      ${wantsTwoFlavors 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card hover:border-primary/50'
                      }
                    `}
                  >
                    <div className={`
                      w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all mb-2
                      ${wantsTwoFlavors 
                        ? 'gradient-hero border-transparent' 
                        : 'border-border'
                      }
                    `}>
                      {wantsTwoFlavors && <Check size={12} className="sm:w-3.5 sm:h-3.5 text-primary-foreground" />}
                    </div>
                    <p className="font-bold text-sm sm:text-base text-foreground">2 Sabores</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      Meio a meio
                    </p>
                  </button>
                </div>

                {/* First flavor display */}
                <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 mb-2">
                  <p className="text-xs text-muted-foreground mb-1">{wantsTwoFlavors ? '1º Sabor' : 'Sabor'}</p>
                  <p className="font-bold text-foreground">{pizza.name}</p>
                </div>

                {/* Second flavor selection */}
                {wantsTwoFlavors && (
                  <div className="p-3 sm:p-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-2">2º Sabor</p>
                    <Select value={secondFlavor} onValueChange={setSecondFlavor}>
                      <SelectTrigger className="w-full bg-background border-border">
                        <SelectValue placeholder="Escolha o segundo sabor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSecondFlavors.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{p.name}</span>
                              <span className="text-xs text-muted-foreground">
                                R$ {p.prices[selectedSize as keyof typeof p.prices].toFixed(2)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {secondFlavor && (
                      <p className="text-xs text-primary mt-2 font-medium">
                        ✓ {availablePizzas.find(p => p.id === secondFlavor)?.name}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      💡 O valor será do sabor mais caro
                    </p>
                  </div>
                )}
              </div>

            {/* Content */}
            <div className="p-3 sm:p-4 pb-28 sm:pb-32">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-1 sm:mb-2">
                {pizza.name}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{pizza.description}</p>
              
              {/* Size Selection */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-display font-semibold text-sm sm:text-base text-foreground mb-2 sm:mb-3">
                  Tamanho
                </h3>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size.id;
                    const price = pizza.prices[size.id as keyof typeof pizza.prices];
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`
                          relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all active:scale-[0.98]
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-card hover:border-primary/50'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full gradient-hero flex items-center justify-center">
                            <Check size={10} className="sm:w-3 sm:h-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="font-bold text-sm sm:text-base text-foreground">{size.name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {size.slices} • {size.serves}
                          </p>
                          <p className="font-bold text-primary text-sm sm:text-base mt-0.5 sm:mt-1">
                            R$ {price.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Crust Selection */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-display font-semibold text-sm sm:text-base text-foreground mb-2 sm:mb-3">
                  Borda
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {crusts.map((crust) => {
                    const isSelected = selectedCrust === crust.id;
                    return (
                      <button
                        key={crust.id}
                        onClick={() => setSelectedCrust(crust.id)}
                        className={`
                          px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all active:scale-95
                          ${isSelected 
                            ? 'gradient-hero text-primary-foreground shadow-glow' 
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }
                        `}
                      >
                        {crust.name}
                        {crust.price > 0 && (
                          <span className="ml-1 opacity-80">+R${crust.price}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Extras */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-display font-semibold text-sm sm:text-base text-foreground mb-2 sm:mb-3">
                  Adicionais
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {extras.map((extra) => {
                    const isSelected = selectedExtras.includes(extra.id);
                    return (
                      <button
                        key={extra.id}
                        onClick={() => toggleExtra(extra.id)}
                        className={`
                          w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl 
                          border-2 transition-all active:scale-[0.98]
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-card hover:border-primary/50'
                          }
                        `}
                      >
                        <span className="font-medium text-sm sm:text-base text-foreground">{extra.name}</span>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-primary font-bold text-sm sm:text-base">
                            +R$ {extra.price.toFixed(2)}
                          </span>
                          <div className={`
                            w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all
                            ${isSelected 
                              ? 'gradient-hero border-transparent' 
                              : 'border-border'
                            }
                          `}>
                            {isSelected && <Check size={12} className="sm:w-3.5 sm:h-3.5 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Observações */}
              <div className="mb-4 sm:mb-6">
                <h3 className="font-display font-semibold text-sm sm:text-base text-foreground mb-2 sm:mb-3">
                  Observações
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Tirar cebola, bem assada..."
                  maxLength={200}
                  className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                  rows={2}
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 text-right">
                  {notes.length}/200
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 sm:p-4 safe-area-bottom">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Quantity */}
                <div className="flex items-center gap-2 sm:gap-3 bg-secondary rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-background flex items-center justify-center active:scale-95"
                  >
                    <Minus size={16} className="sm:w-[18px] sm:h-[18px] text-foreground" />
                  </button>
                  <span className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-background flex items-center justify-center active:scale-95"
                  >
                    <Plus size={16} className="sm:w-[18px] sm:h-[18px] text-foreground" />
                  </button>
                </div>
                
                {/* Add Button */}
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-10 sm:h-12 gradient-hero text-primary-foreground font-bold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-glow active:scale-[0.98]"
                >
                  Adicionar • R$ {totalPrice.toFixed(2)}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PizzaCustomizer;
