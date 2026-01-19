import React from 'react';
import { ShoppingCart, Clock, MapPin, MessageCircle } from 'lucide-react';
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
      className="sticky top-0 z-50 glass-card border-b"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Name */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center shadow-glow">
              <span className="text-2xl">🍕</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">
                {pizzeria.name}
              </h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>{pizzeria.openingHours}</span>
              </div>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link 
              to="/chat"
              className="relative p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <MessageCircle size={22} className="text-foreground" />
            </Link>
            
            <Link 
              to="/cart"
              className="relative p-3 rounded-xl gradient-hero shadow-glow hover:opacity-90 transition-opacity"
            >
              <ShoppingCart size={22} className="text-primary-foreground" />
              {totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center"
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
