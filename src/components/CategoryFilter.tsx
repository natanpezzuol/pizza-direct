import React from 'react';
import { motion } from 'framer-motion';
import { categories } from '@/data/menuData';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryFilter = ({ selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
      <div className="flex gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible">
        {categories.map((category, index) => {
          const isActive = selectedCategory === category.id;
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectCategory(category.id)}
              className={`
                relative flex items-center gap-1.5 sm:gap-2 md:gap-2.5 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl 
                whitespace-nowrap font-medium text-xs sm:text-sm md:text-base transition-all active:scale-95 hover:scale-[1.02]
                ${isActive 
                  ? 'gradient-hero text-primary-foreground shadow-glow' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }
              `}
            >
              <span className="text-base sm:text-lg md:text-xl">{category.icon}</span>
              <span>{category.name}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryFilter;
