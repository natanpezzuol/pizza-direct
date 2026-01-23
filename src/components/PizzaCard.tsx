import React from 'react';
import { motion } from 'framer-motion';
import { Star, Plus } from 'lucide-react';
import { Pizza } from '@/data/menuData';

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
  '6': pizzaCalabresa, // pepperoni uses calabresa image
  '7': pizzaMargherita, // napolitana uses margherita
  '8': pizzaFrango, // filé mignon uses frango
  '9': pizzaChocolate,
  '10': pizzaChocolate, // romeu e julieta uses chocolate
};

interface PizzaCardProps {
  pizza: Pizza;
  onClick: () => void;
  index: number;
}

const PizzaCard = ({ pizza, onClick, index }: PizzaCardProps) => {
  const image = pizzaImages[pizza.id] || pizzaMargherita;
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="relative bg-card rounded-2xl sm:rounded-3xl shadow-card overflow-hidden cursor-pointer 
                 hover:shadow-elevated active:scale-[0.98] transition-all duration-300 group"
    >
      {/* Image Container */}
      <div className="relative h-28 sm:h-36 overflow-hidden">
        <img 
          src={image} 
          alt={pizza.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Popular Badge */}
        {pizza.popular && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-0.5 sm:gap-1 bg-accent rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1">
            <Star size={10} className="sm:w-3 sm:h-3 fill-accent-foreground text-accent-foreground" />
            <span className="text-[10px] sm:text-xs font-bold text-accent-foreground">Popular</span>
          </div>
        )}
        
        {/* Quick Add Button - always visible on mobile */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-hero 
                     flex items-center justify-center shadow-glow 
                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Plus size={16} className="sm:w-5 sm:h-5 text-primary-foreground" />
        </motion.button>
      </div>
      
      {/* Content */}
      <div className="p-3 sm:p-4">
        <h3 className="font-display font-bold text-foreground text-base sm:text-lg mb-0.5 sm:mb-1">
          {pizza.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
          {pizza.description}
        </p>
        
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] sm:text-xs text-muted-foreground">a partir de</span>
          <span className="font-display font-bold text-primary text-base sm:text-lg">
            R$ {pizza.prices.small.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default PizzaCard;
