import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Check } from 'lucide-react';
import { Pizza, sizes, crusts, extras } from '@/data/menuData';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
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
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedCrust, setSelectedCrust] = useState('tradicional');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const image = pizzaImages[pizza.id] || pizzaMargherita;
  
  const basePrice = pizza.prices[selectedSize as keyof typeof pizza.prices];
  const crustPrice = crusts.find(c => c.id === selectedCrust)?.price || 0;
  const extrasPrice = selectedExtras.reduce((acc, extraId) => {
    const extra = extras.find(e => e.id === extraId);
    return acc + (extra?.price || 0);
  }, 0);
  
  const totalPrice = (basePrice + crustPrice + extrasPrice) * quantity;

  const handleAddToCart = () => {
    if (!user) {
      onClose();
      navigate('/auth');
      return;
    }
    
    addItem({
      id: '',
      name: pizza.name,
      size: sizes.find(s => s.id === selectedSize)?.name || '',
      flavors: [pizza.name],
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
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       bg-background rounded-t-2xl sm:rounded-t-3xl md:rounded-3xl z-50 
                       max-h-[85vh] sm:max-h-[90vh] md:max-h-[85vh] md:max-w-2xl md:w-full 
                       overflow-y-auto md:shadow-2xl"
          >
            {/* Handle - only on mobile */}
            <div className="sticky top-0 bg-background pt-2 sm:pt-3 pb-1.5 sm:pb-2 z-10 md:hidden">
              <div className="w-10 sm:w-12 h-1 sm:h-1.5 bg-muted rounded-full mx-auto" />
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 sm:top-4 md:top-5 right-3 sm:right-4 md:right-5 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center z-20 active:scale-95 transition-colors"
            >
              <X size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-foreground" />
            </button>
            
            {/* Image */}
            <div className="relative h-36 sm:h-48 md:h-64 mx-3 sm:mx-4 md:mx-6 md:mt-4 rounded-xl sm:rounded-2xl overflow-hidden">
              <img 
                src={image} 
                alt={pizza.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="p-3 sm:p-4 md:p-6 pb-28 sm:pb-32 md:pb-28">
              <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-foreground mb-1 sm:mb-2 md:mb-3">
                {pizza.name}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 md:mb-8">{pizza.description}</p>
              
              {/* Size Selection */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h3 className="font-display font-semibold text-sm sm:text-base md:text-lg text-foreground mb-2 sm:mb-3 md:mb-4">
                  Tamanho
                </h3>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size.id;
                    const price = pizza.prices[size.id as keyof typeof pizza.prices];
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`
                          relative p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 transition-all active:scale-[0.98] hover:border-primary/70
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-card hover:border-primary/50'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full gradient-hero flex items-center justify-center">
                            <Check size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="font-bold text-sm sm:text-base md:text-lg text-foreground">{size.name}</p>
                          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                            {size.slices} • {size.serves}
                          </p>
                          <p className="font-bold text-primary text-sm sm:text-base md:text-lg mt-0.5 sm:mt-1 md:mt-2">
                            R$ {price.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Crust Selection */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h3 className="font-display font-semibold text-sm sm:text-base md:text-lg text-foreground mb-2 sm:mb-3 md:mb-4">
                  Borda
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
                  {crusts.map((crust) => {
                    const isSelected = selectedCrust === crust.id;
                    return (
                      <button
                        key={crust.id}
                        onClick={() => setSelectedCrust(crust.id)}
                        className={`
                          px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl md:rounded-2xl font-medium text-xs sm:text-sm md:text-base transition-all active:scale-95 hover:scale-[1.02]
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
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h3 className="font-display font-semibold text-sm sm:text-base md:text-lg text-foreground mb-2 sm:mb-3 md:mb-4">
                  Adicionais
                </h3>
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  {extras.map((extra) => {
                    const isSelected = selectedExtras.includes(extra.id);
                    return (
                      <button
                        key={extra.id}
                        onClick={() => toggleExtra(extra.id)}
                        className={`
                          w-full flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl 
                          border-2 transition-all active:scale-[0.98] hover:border-primary/70
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border bg-card hover:border-primary/50'
                          }
                        `}
                      >
                        <span className="font-medium text-sm sm:text-base md:text-lg text-foreground">{extra.name}</span>
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                          <span className="text-primary font-bold text-sm sm:text-base md:text-lg">
                            +R$ {extra.price.toFixed(2)}
                          </span>
                          <div className={`
                            w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center transition-all
                            ${isSelected 
                              ? 'gradient-hero border-transparent' 
                              : 'border-border'
                            }
                          `}>
                            {isSelected && <Check size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Observações */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h3 className="font-display font-semibold text-sm sm:text-base md:text-lg text-foreground mb-2 sm:mb-3 md:mb-4">
                  Observações
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Tirar cebola, bem assada..."
                  maxLength={200}
                  className="w-full p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-border bg-card text-sm sm:text-base md:text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                  rows={2}
                />
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 text-right">
                  {notes.length}/200
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 md:sticky md:bottom-auto bg-background border-t p-3 sm:p-4 md:p-6 safe-area-bottom md:rounded-b-3xl">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
                {/* Quantity */}
                <div className="flex items-center gap-2 sm:gap-3 bg-secondary rounded-lg sm:rounded-xl md:rounded-2xl p-0.5 sm:p-1 md:p-1.5">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md sm:rounded-lg md:rounded-xl bg-background flex items-center justify-center active:scale-95 hover:bg-muted transition-colors"
                  >
                    <Minus size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-foreground" />
                  </button>
                  <span className="w-6 sm:w-8 md:w-10 text-center font-bold text-sm sm:text-base md:text-lg text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md sm:rounded-lg md:rounded-xl bg-background flex items-center justify-center active:scale-95 hover:bg-muted transition-colors"
                  >
                    <Plus size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 text-foreground" />
                  </button>
                </div>
                
                {/* Add Button */}
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-10 sm:h-12 md:h-14 gradient-hero text-primary-foreground font-bold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl md:rounded-2xl shadow-glow active:scale-[0.98] hover:opacity-95 transition-all"
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
