import React from 'react';
import { useAdmin, Order } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Clock, MapPin, Phone, User, CreditCard, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-blue-500' },
  { value: 'preparing', label: 'Preparando', color: 'bg-orange-500' },
  { value: 'delivering', label: 'Em Entrega', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Entregue', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
];

const AdminOrders = () => {
  const { orders, updateOrderStatus, fetchOrders } = useAdmin();
  const { toast } = useToast();

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

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg">Pedidos</h2>
        <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map(order => {
          const statusInfo = getStatusInfo(order.status);
          return (
            <Card key={order.id}>
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                      <span className="font-semibold text-sm">
                        Pedido #{order.id.slice(0, 8)}
                      </span>
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
                    <span className="capitalize">{order.payment_method}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t pt-3 mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Itens do Pedido:</p>
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name} ({item.size})
                        </span>
                        <span className="text-muted-foreground">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
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
