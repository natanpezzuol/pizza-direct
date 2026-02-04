import React, { useState } from 'react';
import { useAdmin, Order } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Clock, MapPin, Phone, User, CreditCard, RefreshCw, Check, X, ChefHat, Truck, Star, Circle, Ruler, MessageSquare, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusOptions = [
  { value: 'received', label: 'Recebido', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-500', textColor: 'text-blue-600' },
  { value: 'preparing', label: 'Em Preparo', color: 'bg-orange-500', textColor: 'text-orange-600' },
  { value: 'delivering', label: 'Em Entrega', color: 'bg-purple-500', textColor: 'text-purple-600' },
  { value: 'delivered', label: 'Entregue', color: 'bg-green-500', textColor: 'text-green-600' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500', textColor: 'text-red-600' },
];

const paymentMethodLabels: Record<string, string> = {
  credit_online: 'Cartão de Crédito Online',
  card_delivery: 'Cartão na Entrega',
  pix: 'PIX',
  cash: 'Dinheiro',
};

type FilterStatus = 'all' | 'pending' | 'active' | 'completed';

const AdminOrders = () => {
  const { orders, updateOrderStatus, fetchOrders } = useAdmin();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await updateOrderStatus(orderId, newStatus);
    if (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Status atualizado',
        description: 'O pedido foi atualizado com sucesso.',
      });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    await handleStatusChange(orderId, 'preparing');
  };

  const handleRejectOrder = async (orderId: string) => {
    await handleStatusChange(orderId, 'cancelled');
  };

  const handleStartDelivery = async (orderId: string) => {
    await handleStatusChange(orderId, 'delivering');
  };

  const handleCompleteOrder = async (orderId: string) => {
    await handleStatusChange(orderId, 'delivered');
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const filteredOrders = orders.filter(order => {
    switch (filterStatus) {
      case 'pending':
        return order.status === 'pending' || order.status === 'received';
      case 'active':
        return ['confirmed', 'preparing', 'delivering'].includes(order.status);
      case 'completed':
        return ['delivered', 'cancelled'].includes(order.status);
      default:
        return true;
    }
  });

  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'received').length;
  const activeCount = orders.filter(o => ['confirmed', 'preparing', 'delivering'].includes(o.status)).length;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Central de Pedidos</h2>
          <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-yellow-700">Aguardando</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
              <p className="text-xs text-blue-700">Em Andamento</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{orders.length}</p>
              <p className="text-xs text-green-700">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Todos
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
            className="relative"
          >
            Pendentes
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">{pendingCount}</Badge>
            )}
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Em Andamento
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('completed')}
          >
            Finalizados
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => {
          const statusInfo = getStatusInfo(order.status);
          const isPending = order.status === 'pending' || order.status === 'received';
          const isPreparing = order.status === 'preparing';
          const isDelivering = order.status === 'delivering';

          return (
            <Card key={order.id} className={isPending ? 'border-yellow-400 border-2 shadow-lg' : ''}>
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                      <span className="font-semibold text-sm">
                        Pedido #{order.id.slice(0, 8)}
                      </span>
                      <Badge variant="outline" className={statusInfo.textColor}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status.color}`} />
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Actions for Pending Orders */}
                {isPending && (
                  <div className="flex gap-2 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleAcceptOrder(order.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aceitar Pedido
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleRejectOrder(order.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                )}

                {/* Quick Actions for Preparing Orders */}
                {isPreparing && (
                  <div className="flex gap-2 mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleStartDelivery(order.id)}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Saiu para Entrega
                    </Button>
                  </div>
                )}

                {/* Quick Actions for Delivering Orders */}
                {isDelivering && (
                  <div className="flex gap-2 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleCompleteOrder(order.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Marcar como Entregue
                    </Button>
                  </div>
                )}

                {/* Customer Info */}
                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer_phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">{order.delivery_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{paymentMethodLabels[order.payment_method] || order.payment_method}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t pt-3 mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Itens do Pedido:</p>
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="bg-muted/50 p-3 rounded-lg text-sm space-y-2 border">
                        {/* Item Header */}
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-base">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-bold text-primary whitespace-nowrap ml-2">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Details Grid */}
                        <div className="flex flex-wrap gap-2">
                          {/* Tamanho */}
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
                            <Ruler className="h-3 w-3" />
                            {item.size}
                          </Badge>
                          
                          {/* Borda */}
                          {item.crust && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300 gap-1 font-medium">
                              <Circle className="h-3 w-3" />
                              Borda: {item.crust}
                            </Badge>
                          )}
                        </div>

                        {/* Sabores */}
                        {item.flavors && item.flavors.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Sabores: </span>
                            <span>{item.flavors.join(', ')}</span>
                          </div>
                        )}

                        {/* Adicionais */}
                        {item.extras && item.extras.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.extras.map((extra: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs gap-1">
                                <Plus className="h-3 w-3" />
                                {extra}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Observações */}
                        {item.notes && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2 text-xs flex items-start gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-orange-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium text-orange-700">Observações: </span>
                              <span className="text-orange-800">{item.notes}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-muted p-2 rounded text-sm mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Observações:</p>
                    <p>{order.notes}</p>
                  </div>
                )}

                {/* Customer Rating */}
                {order.rating && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium text-yellow-700">Avaliação do Cliente:</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= order.rating!.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-yellow-700">
                        {order.rating.rating}/5
                      </span>
                    </div>
                    {order.rating.comment && (
                      <p className="text-sm text-yellow-800 italic">"{order.rating.comment}"</p>
                    )}
                  </div>
                )}

                {/* Totals */}
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de Entrega</span>
                    <span>R$ {order.delivery_fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOrders;
