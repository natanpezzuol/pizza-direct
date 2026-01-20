import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationsContext';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const pizzeria = usePizzeria();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const menuItems = [
    { icon: MapPin, label: 'Endereços', path: '/addresses' },
    { icon: CreditCard, label: 'Formas de Pagamento' },
    { icon: Bell, label: 'Notificações', path: '/notifications', badge: unreadCount },
    { icon: HelpCircle, label: 'Ajuda e Suporte' },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Até logo!',
      description: 'Você saiu da sua conta'
    });
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-card border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft size={24} className="text-foreground" />
              </Link>
              <h1 className="font-display font-bold text-xl text-foreground">
                Meu Perfil
              </h1>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Você não está logado</h2>
            <p className="text-muted-foreground mb-6">Entre ou crie uma conta para acessar seu perfil</p>
            <Button
              onClick={() => navigate('/auth')}
              className="gradient-hero text-primary-foreground"
            >
              <LogIn size={20} className="mr-2" />
              Entrar ou Cadastrar
            </Button>
          </motion.div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft size={24} className="text-foreground" />
            </Link>
            <h1 className="font-display font-bold text-xl text-foreground">
              Meu Perfil
            </h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 shadow-card mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center shadow-glow">
              <User size={28} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">
                {user.user_metadata?.name || 'Cliente'}
              </h2>
              <p className="text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-secondary rounded-2xl p-3">
              <p className="font-display font-bold text-2xl text-primary">12</p>
              <p className="text-xs text-muted-foreground">Pedidos</p>
            </div>
            <div className="bg-secondary rounded-2xl p-3">
              <p className="font-display font-bold text-2xl text-primary">3</p>
              <p className="text-xs text-muted-foreground">Favoritos</p>
            </div>
            <div className="bg-secondary rounded-2xl p-3">
              <p className="font-display font-bold text-2xl text-primary">⭐</p>
              <p className="text-xs text-muted-foreground">VIP</p>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const content = (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full flex items-center justify-between p-4 bg-card rounded-2xl 
                           shadow-card hover:shadow-elevated transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center relative">
                    <item.icon size={20} className="text-foreground" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </motion.div>
            );

            if (item.path) {
              return (
                <Link key={item.label} to={item.path}>
                  {content}
                </Link>
              );
            }

            return <div key={item.label}>{content}</div>;
          })}
        </div>

        {/* Pizzeria Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-secondary/50 rounded-2xl text-center"
        >
          <p className="text-sm text-muted-foreground mb-1">Você está em</p>
          <p className="font-display font-bold text-foreground">{pizzeria.name}</p>
          <p className="text-sm text-muted-foreground">{pizzeria.address}</p>
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleSignOut}
          className="w-full mt-6 flex items-center justify-center gap-2 p-4 rounded-2xl 
                     border-2 border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair da Conta</span>
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
