import React, { useState, useEffect } from 'react';
import { useAdmin, PizzeriaSettings } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Store, MapPin, Phone, Clock, Truck, DollarSign, Palette } from 'lucide-react';

const AdminSettings = () => {
  const { settings, updateSettings } = useAdmin();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<PizzeriaSettings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof PizzeriaSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateSettings(formData);
    setSaving(false);

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Configurações salvas',
        description: 'As alterações foram salvas com sucesso.',
      });
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Pizzaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-5 w-5" />
            Status da Pizzaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Pizzaria Aberta</Label>
              <p className="text-sm text-muted-foreground">
                {formData.is_open ? 'Aceitando pedidos' : 'Fechada para pedidos'}
              </p>
            </div>
            <Switch
              checked={formData.is_open}
              onCheckedChange={(checked) => handleChange('is_open', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Pizzaria</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nome da pizzaria"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Endereço completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone
            </Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening_hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Funcionamento
            </Label>
            <Input
              id="opening_hours"
              value={formData.opening_hours || ''}
              onChange={(e) => handleChange('opening_hours', e.target.value)}
              placeholder="18:00 - 23:30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5" />
            Configurações de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery_time">Tempo de Entrega</Label>
            <Input
              id="delivery_time"
              value={formData.delivery_time || ''}
              onChange={(e) => handleChange('delivery_time', e.target.value)}
              placeholder="30-45 min"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_order" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pedido Mínimo
              </Label>
              <Input
                id="minimum_order"
                type="number"
                step="0.01"
                value={formData.minimum_order || 0}
                onChange={(e) => handleChange('minimum_order', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Taxa de Entrega</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="0.01"
                value={formData.delivery_fee || 0}
                onChange={(e) => handleChange('delivery_fee', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-5 w-5" />
            Personalização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="primary_color">Cor Principal</Label>
            <div className="flex gap-3">
              <Input
                id="primary_color"
                type="color"
                value={formData.primary_color || '#E85D04'}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={formData.primary_color || '#E85D04'}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                placeholder="#E85D04"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full"
        size="lg"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Salvar Alterações
      </Button>
    </div>
  );
};

export default AdminSettings;
