import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Truck, Star } from 'lucide-react';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import heroBanner from '@/assets/hero-banner.jpg';

const HeroBanner = () => {
  const pizzeria = usePizzeria();

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-40 sm:h-56 md:h-72 lg:h-80 overflow-hidden rounded-2xl sm:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8 mt-3 sm:mt-4 md:mt-6"
    >
      {/* Background Image */}
      <img 
        src={heroBanner} 
        alt="Pizza artesanal" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-3 sm:p-5 md:p-8 lg:p-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl"
        >
          <h2 className="font-display text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground mb-1.5 sm:mb-2 md:mb-4">
            Pizzas artesanais feitas com amor 🍕
          </h2>
          
          <div className="flex flex-wrap gap-1.5 sm:gap-3 md:gap-4">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-background/20 backdrop-blur-md rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2">
              <Clock size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-accent" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-primary-foreground">
                {pizzeria.deliveryTime}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-background/20 backdrop-blur-md rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2">
              <Truck size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-accent" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-primary-foreground">
                R$ {pizzeria.deliveryFee.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-background/20 backdrop-blur-md rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2">
              <Star size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-accent fill-accent" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium text-primary-foreground">
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
