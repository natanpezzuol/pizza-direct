import React, { useState } from 'react';
import { useAdmin, MenuItem } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Pizza, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const categories = [
  { id: 'tradicionais', name: 'Tradicionais' },
  { id: 'especiais', name: 'Especiais' },
  { id: 'premium', name: 'Premium' },
  { id: 'doces', name: 'Doces' },
];

const emptyItem: Omit<MenuItem, 'id'> = {
  name: '',
  description: '',
  image_url: null,
  category: 'tradicionais',
  price_small: 0,
  price_medium: 0,
  price_large: 0,
  price_family: 0,
  is_popular: false,
  is_available: true,
  sort_order: 0,
};

const AdminMenu = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAdmin();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>(emptyItem);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof MenuItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      category: item.category,
      price_small: item.price_small,
      price_medium: item.price_medium,
      price_large: item.price_large,
      price_family: item.price_family,
      is_popular: item.is_popular,
      is_available: item.is_available,
      sort_order: item.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData(emptyItem);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    let result;
    if (editingItem) {
      result = await updateMenuItem(editingItem.id, formData);
    } else {
      result = await addMenuItem(formData);
    }

    setSaving(false);

    if (result.error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o item.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingItem ? 'Item atualizado' : 'Item adicionado',
        description: 'O item foi salvo com sucesso.',
      });
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const { error } = await deleteMenuItem(id);
    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o item.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Item excluído',
        description: 'O item foi removido com sucesso.',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg">Cardápio</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Nome *</Label>
                <Input
                  id="item-name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nome da pizza"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-description">Descrição *</Label>
                <Textarea
                  id="item-description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Ingredientes da pizza"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-image">URL da Imagem</Label>
                <Input
                  id="item-image"
                  value={formData.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value || null)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço P</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_small}
                    onChange={(e) => handleChange('price_small', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço M</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_medium}
                    onChange={(e) => handleChange('price_medium', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço G</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_large}
                    onChange={(e) => handleChange('price_large', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço GG</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_family}
                    onChange={(e) => handleChange('price_family', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Destaque (Popular)</Label>
                <Switch
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => handleChange('is_popular', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Disponível</Label>
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => handleChange('is_available', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ordem de Exibição</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {menuItems.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Pizza className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum item no cardápio.</p>
            <p className="text-sm text-muted-foreground">Clique em "Adicionar" para criar o primeiro item.</p>
          </CardContent>
        </Card>
      )}

      {/* Menu Items List */}
      <div className="space-y-3">
        {menuItems.map(item => (
          <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                      {categories.find(c => c.id === item.category)?.name || item.category}
                    </span>
                    {item.is_popular && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Destaque
                      </span>
                    )}
                    {!item.is_available && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        Indisponível
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span>P: R$ {item.price_small.toFixed(2)}</span>
                    <span>M: R$ {item.price_medium.toFixed(2)}</span>
                    <span>G: R$ {item.price_large.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminMenu;
