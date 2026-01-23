import React from 'react';
import { Home, Search, ClipboardList, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Search, label: 'Buscar', path: '/search' },
    ...(user ? [{ icon: ClipboardList, label: 'Pedidos', path: '/orders' }] : []),
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t safe-area-bottom">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around py-1.5 sm:py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-3 sm:px-4 active:scale-95 transition-transform"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl sm:rounded-2xl gradient-hero opacity-10"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon 
                  size={22} 
                  className={`sm:w-6 sm:h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} 
                />
                <span 
                  className={`text-[10px] sm:text-xs font-medium ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
