import React, { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import HeroBanner from '@/components/HeroBanner';
import CategoryFilter from '@/components/CategoryFilter';
import PizzaCard from '@/components/PizzaCard';
import PizzaCustomizer from '@/components/PizzaCustomizer';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Pizza } from '@/data/menuData';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const { pizzas, loading } = useMenuItems();

  const filteredPizzas = selectedCategory === 'all' 
    ? pizzas 
    : pizzas.filter(p => p.category === selectedCategory);

  // Separate popular pizzas for featured section
  const popularPizzas = pizzas.filter(p => p.popular);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-24">
      <Header />
      
      <main>
        <HeroBanner />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Popular Section */}
            {selectedCategory === 'all' && popularPizzas.length > 0 && (
              <section className="px-3 sm:px-4 pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-foreground">
                    🔥 Mais Pedidas
                  </h2>
                </div>
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
                  {popularPizzas.map((pizza, index) => (
                    <div key={pizza.id} className="min-w-[220px] max-w-[220px] sm:min-w-[280px] sm:max-w-[280px]">
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
            <section className="px-3 sm:px-4 pb-4 sm:pb-6">
              <h2 className="font-display font-bold text-lg sm:text-xl text-foreground mb-3 sm:mb-4">
                {selectedCategory === 'all' ? '📋 Cardápio Completo' : '🍕 ' + selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </h2>
              {filteredPizzas.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {filteredPizzas.map((pizza, index) => (
                    <PizzaCard 
                      key={pizza.id}
                      pizza={pizza}
                      onClick={() => setSelectedPizza(pizza)}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma pizza encontrada nesta categoria
                </div>
              )}
            </section>
          </>
        )}
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
