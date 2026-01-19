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
      className="relative h-56 overflow-hidden rounded-3xl mx-4 mt-4"
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
      <div className="relative h-full flex flex-col justify-end p-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-2xl font-bold text-primary-foreground mb-2">
            Pizzas artesanais feitas com amor 🍕
          </h2>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-background/20 backdrop-blur-md rounded-full px-3 py-1.5">
              <Clock size={14} className="text-accent" />
              <span className="text-xs font-medium text-primary-foreground">
                {pizzeria.deliveryTime}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-background/20 backdrop-blur-md rounded-full px-3 py-1.5">
              <Truck size={14} className="text-accent" />
              <span className="text-xs font-medium text-primary-foreground">
                R$ {pizzeria.deliveryFee.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-background/20 backdrop-blur-md rounded-full px-3 py-1.5">
              <Star size={14} className="text-accent fill-accent" />
              <span className="text-xs font-medium text-primary-foreground">
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
