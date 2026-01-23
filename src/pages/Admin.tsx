import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Pizza, ShoppingBag, Users } from 'lucide-react';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminMenu from '@/components/admin/AdminMenu';
import AdminOrders from '@/components/admin/AdminOrders';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState('settings');

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display font-bold text-lg">Painel Admin</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Pizza className="h-4 w-4" />
              <span className="hidden sm:inline">Cardápio</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="menu">
            <AdminMenu />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
