import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, Smile } from 'lucide-react';
import { usePizzeria } from '@/contexts/PizzeriaContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'pizzeria';
  timestamp: Date;
}

const ChatInterface = () => {
  const pizzeria = usePizzeria();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá! 👋 Bem-vindo(a) ao ${pizzeria.name}! Como posso ajudar você hoje?`,
      sender: 'pizzeria',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    // Simulate pizzeria response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pela mensagem! Em breve um atendente irá responder. ⏳',
        sender: 'pizzeria',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] rounded-2xl px-4 py-3
                ${message.sender === 'user' 
                  ? 'gradient-hero text-primary-foreground rounded-br-md' 
                  : 'bg-card shadow-card text-foreground rounded-bl-md'
                }
              `}>
                <p className="text-sm">{message.text}</p>
                <p className={`
                  text-xs mt-1
                  ${message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                `}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Input */}
      <div className="p-4 bg-background border-t safe-area-bottom">
        <div className="flex items-center gap-2">
          <button className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <Image size={20} className="text-muted-foreground" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary text-foreground 
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 
                         focus:ring-primary/50"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <Smile size={20} className="text-muted-foreground" />
            </button>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="p-3 rounded-xl gradient-hero shadow-glow"
          >
            <Send size={20} className="text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
