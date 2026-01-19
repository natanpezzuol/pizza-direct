import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pizzas, Pizza } from '@/data/menuData';
import PizzaCard from '@/components/PizzaCard';
import PizzaCustomizer from '@/components/PizzaCustomizer';
import BottomNav from '@/components/BottomNav';

const Search = () => {
  const [query, setQuery] = useState('');
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);

  const filteredPizzas = query.trim()
    ? pizzas.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft size={24} className="text-foreground" />
            </Link>
            
            <div className="flex-1 relative">
              <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pizzas..."
                autoFocus
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-secondary text-foreground 
                           placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                           focus:ring-primary/50"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={18} className="text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {!query.trim() ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={32} className="text-muted-foreground" />
            </div>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">
              O que você procura?
            </h2>
            <p className="text-muted-foreground">
              Digite o nome da pizza ou ingrediente
            </p>
            
            {/* Popular Searches */}
            <div className="mt-8">
              <p className="text-sm text-muted-foreground mb-3">Buscas populares</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Calabresa', 'Margherita', 'Frango', 'Chocolate'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground 
                               hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : filteredPizzas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-2xl mb-2">😕</p>
            <h2 className="font-display font-bold text-lg text-foreground mb-2">
              Nenhuma pizza encontrada
            </h2>
            <p className="text-muted-foreground">
              Tente buscar por outro termo
            </p>
          </motion.div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredPizzas.length} resultado(s) para "{query}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPizzas.map((pizza, index) => (
                <PizzaCard 
                  key={pizza.id}
                  pizza={pizza}
                  onClick={() => setSelectedPizza(pizza)}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />

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

export default Search;
