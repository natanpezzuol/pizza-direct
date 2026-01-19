import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
  index: number;
}

const CartItemComponent = ({ item, index }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl p-4 shadow-card"
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-foreground">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.size} • {item.crust}
              </p>
              {item.extras.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  +{item.extras.join(', ')}
                </p>
              )}
            </div>
            
            <button
              onClick={() => removeItem(item.id)}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={18} className="text-destructive" />
            </button>
          </div>
          
          {/* Price and Quantity */}
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-primary">
              R$ {(item.price * item.quantity).toFixed(2)}
            </span>
            
            <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-background flex items-center justify-center"
              >
                <Minus size={16} className="text-foreground" />
              </button>
              <span className="w-6 text-center font-bold text-foreground text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-background flex items-center justify-center"
              >
                <Plus size={16} className="text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItemComponent;
