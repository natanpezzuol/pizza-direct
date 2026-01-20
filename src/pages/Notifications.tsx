import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, BellOff, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft size={24} className="text-foreground" />
              </Link>
              <h1 className="font-display font-bold text-xl text-foreground">
                Notificações
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-muted-foreground"
                >
                  <Check size={16} className="mr-1" />
                  Marcar lidas
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <BellOff size={40} className="text-muted-foreground" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              Nenhuma notificação
            </h2>
            <p className="text-muted-foreground text-center">
              Suas notificações aparecerão aqui
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => markAsRead(notification.id)}
                  className={`
                    p-4 rounded-2xl shadow-card cursor-pointer transition-all
                    ${notification.read ? 'bg-card' : 'bg-primary/5 border-l-4 border-primary'}
                  `}
                >
                  <div className="flex gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h3 className={`font-medium ${notification.read ? 'text-foreground' : 'text-foreground font-bold'}`}>
                        {notification.title}
                      </h3>
                      {notification.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {notifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4"
              >
                <Button
                  variant="outline"
                  onClick={clearNotifications}
                  className="w-full border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={16} className="mr-2" />
                  Limpar todas
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
