import React from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import ChatInterface from '@/components/ChatInterface';
import BottomNav from '@/components/BottomNav';

const Chat = () => {
  const pizzeria = usePizzeria();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 glass-card border-b z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft size={24} className="text-foreground" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                  <span className="text-lg">🍕</span>
                </div>
                <div>
                  <h1 className="font-display font-bold text-foreground">
                    {pizzeria.name}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs text-success">Online agora</span>
                  </div>
                </div>
              </div>
            </div>
            <a 
              href={`tel:${pizzeria.phone}`}
              className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Phone size={20} className="text-foreground" />
            </a>
          </div>
        </div>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-hidden pb-20">
        <ChatInterface />
      </div>

      <BottomNav />
    </div>
  );
};

export default Chat;
