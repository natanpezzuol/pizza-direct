import React, { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import HeroBanner from '@/components/HeroBanner';
import CategoryFilter from '@/components/CategoryFilter';
import PizzaCard from '@/components/PizzaCard';
import PizzaCustomizer from '@/components/PizzaCustomizer';
import { pizzas, Pizza } from '@/data/menuData';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);

  const filteredPizzas = selectedCategory === 'all' 
    ? pizzas 
    : pizzas.filter(p => p.category === selectedCategory);

  // Separate popular pizzas for featured section
  const popularPizzas = pizzas.filter(p => p.popular);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24 md:pb-8">
      <Header />
      
      <main className="max-w-7xl mx-auto">
        <HeroBanner />
        
        {/* Popular Section */}
        {selectedCategory === 'all' && popularPizzas.length > 0 && (
          <section className="px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
              <h2 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-foreground">
                🔥 Mais Pedidas
              </h2>
            </div>
            <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
              {popularPizzas.map((pizza, index) => (
                <div key={pizza.id} className="min-w-[220px] max-w-[220px] sm:min-w-[280px] sm:max-w-[280px] md:min-w-[320px] md:max-w-[320px] lg:min-w-[360px] lg:max-w-[360px]">
                  <PizzaCard 
                    pizza={pizza}
                    onClick={() => setSelectedPizza(pizza)}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        {/* Menu Grid */}
        <section className="px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
          <h2 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-foreground mb-3 sm:mb-4 md:mb-6">
            {selectedCategory === 'all' ? '📋 Cardápio Completo' : '🍕 ' + selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {filteredPizzas.map((pizza, index) => (
              <PizzaCard 
                key={pizza.id}
                pizza={pizza}
                onClick={() => setSelectedPizza(pizza)}
                index={index}
              />
            ))}
          </div>
        </section>
      </main>
      
      <BottomNav />
      
      {/* Pizza Customizer Modal */}
      {selectedPizza && (
        <PizzaCustomizer 
          pizza={selectedPizza}
          isOpen={!!selectedPizza}
          onClose={() => setSelectedPizza(null)}
        />
      )}
    </div>
  );
};

export default Index;
