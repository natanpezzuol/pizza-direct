import React from 'react';
import { ShoppingCart, Clock, MessageCircle } from 'lucide-react';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  const pizzeria = usePizzeria();
  const { totalItems } = useCart();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-card border-b safe-area-top"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Name */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl gradient-hero flex items-center justify-center shadow-glow flex-shrink-0">
              <span className="text-xl sm:text-2xl md:text-3xl">🍕</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-xl md:text-2xl text-foreground truncate">
                {pizzeria.name}
              </h1>
              <div className="flex items-center gap-1 md:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                <Clock size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">{pizzeria.openingHours}</span>
              </div>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <Link 
              to="/chat"
              className="relative p-2.5 sm:p-3 md:p-3.5 rounded-lg sm:rounded-xl md:rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors active:scale-95"
            >
              <MessageCircle size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6 text-foreground" />
            </Link>
            
            <Link 
              to="/cart"
              className="relative p-2.5 sm:p-3 md:p-3.5 rounded-lg sm:rounded-xl md:rounded-2xl gradient-hero shadow-glow hover:opacity-90 transition-opacity active:scale-95"
            >
              <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6 text-primary-foreground" />
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-accent text-accent-foreground text-[10px] sm:text-xs md:text-sm font-bold flex items-center justify-center"
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
