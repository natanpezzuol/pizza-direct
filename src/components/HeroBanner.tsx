import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Truck, Star, AlertCircle } from 'lucide-react';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import heroBanner from '@/assets/hero-banner.jpg';

const HeroBanner = () => {
  const pizzeria = usePizzeria();
  const isOpen = pizzeria.isOpen;

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-40 sm:h-56 overflow-hidden rounded-2xl sm:rounded-3xl mx-3 sm:mx-4 mt-3 sm:mt-4"
    >
      {/* Background Image */}
      <img 
        src={heroBanner} 
        alt="Pizza artesanal" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${isOpen ? 'from-foreground/90 via-foreground/40' : 'from-destructive/90 via-destructive/40'} to-transparent`} />
      
      {/* Closed Banner */}
      {!isOpen && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs sm:text-sm font-medium">
          <AlertCircle size={14} />
          Fechado
        </div>
      )}
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-3 sm:p-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-lg sm:text-2xl font-bold text-primary-foreground mb-1.5 sm:mb-2">
            Pizzas artesanais feitas com amor 🍕
          </h2>
          
          <div className="flex flex-wrap gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-background/20 backdrop-blur-md rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
              <Clock size={12} className="sm:w-3.5 sm:h-3.5 text-accent" />
              <span className="text-[10px] sm:text-xs font-medium text-primary-foreground">
                {pizzeria.deliveryTime}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5 bg-background/20 backdrop-blur-md rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
              <Truck size={12} className="sm:w-3.5 sm:h-3.5 text-accent" />
              <span className="text-[10px] sm:text-xs font-medium text-primary-foreground">
                R$ {pizzeria.deliveryFee.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5 bg-background/20 backdrop-blur-md rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
              <Star size={12} className="sm:w-3.5 sm:h-3.5 text-accent fill-accent" />
              <span className="text-[10px] sm:text-xs font-medium text-primary-foreground">
                4.8 (120+)
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroBanner;
