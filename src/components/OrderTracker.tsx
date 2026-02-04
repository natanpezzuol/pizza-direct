import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, ChefHat, Truck, Package, Hourglass } from 'lucide-react';

export type OrderStatus = 'received' | 'preparing' | 'delivering' | 'delivered';

interface OrderTrackerProps {
  status: OrderStatus;
  orderId?: string;
  estimatedTime?: string;
}

const steps = [
  { id: 'received', label: 'Recebido', icon: Hourglass, description: 'Aguardando confirmação' },
  { id: 'preparing', label: 'Em Preparo', icon: ChefHat, description: 'Preparando seu pedido' },
  { id: 'delivering', label: 'Saiu para entrega', icon: Truck, description: 'A caminho' },
  { id: 'delivered', label: 'Entregue', icon: Package, description: 'Pedido finalizado' },
];

const OrderTracker = ({ status, orderId, estimatedTime }: OrderTrackerProps) => {
  const currentStepIndex = steps.findIndex(s => s.id === status);
  const displayOrderId = orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : '';

  return (
    <div className="bg-card rounded-3xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-foreground text-lg">
            Status do Pedido
          </h3>
          {displayOrderId && (
            <p className="text-sm text-muted-foreground">
              Pedido {displayOrderId}
            </p>
          )}
        </div>
        {estimatedTime && (
          <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
            <Clock size={14} className="text-primary" />
            <span className="text-sm font-medium text-primary">
              {estimatedTime}
            </span>
          </div>
        )}
      </div>
      
      {/* Steps */}
      <div className="relative">
        {/* Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
        <div 
          className="absolute left-5 top-0 w-0.5 gradient-hero transition-all duration-500"
          style={{ 
            height: currentStepIndex >= 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%'
          }}
        />
        
        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const StepIcon = step.icon;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-center gap-4"
              >
                {/* Icon */}
                <div className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted 
                    ? 'gradient-hero shadow-glow' 
                    : 'bg-secondary'
                  }
                `}>
                  <StepIcon 
                    size={20} 
                    className={isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'} 
                  />
                </div>
                
                {/* Label */}
                <div>
                  <p className={`
                    font-medium transition-colors
                    ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-primary"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;