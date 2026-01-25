import React from 'react';
import { ShoppingCart, Clock, MapPin, MessageCircle } from 'lucide-react';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const Header = () => {
  const pizzeria = usePizzeria();
  const { totalItems } = useCart();
  
  if (pizzeria.loading) {
    return (
      <header className="sticky top-0 z-50 glass-card border-b safe-area-top">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-card border-b safe-area-top"
    >
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Name */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl gradient-hero flex items-center justify-center shadow-glow flex-shrink-0">
              <span className="text-xl sm:text-2xl">🍕</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-xl text-foreground truncate">
                {pizzeria.name}
              </h1>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                <Clock size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="truncate">{pizzeria.openingHours}</span>
              </div>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Link 
              to="/chat"
              className="relative p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
            >
              <MessageCircle size={20} className="sm:w-[22px] sm:h-[22px] text-foreground" />
            </Link>
            
            <Link 
              to="/cart"
              className="relative p-2.5 sm:p-3 rounded-lg sm:rounded-xl gradient-hero shadow-glow hover:opacity-90 transition-opacity active:scale-95"
            >
              <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px] text-primary-foreground" />
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
