import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, Check, Home, Briefcase, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { z } from 'zod';

const addressSchema = z.object({
  label: z.string().min(1, 'Nome é obrigatório'),
  cep: z.string().min(8, 'CEP deve ter 8 dígitos').max(9, 'CEP inválido'),
  street: z.string().min(3, 'Rua é obrigatória').max(200, 'Rua muito longa'),
  city: z.string().min(2, 'Cidade é obrigatória').max(100, 'Cidade muito longa'),
  number: z.string().min(1, 'Número é obrigatório').max(20, 'Número muito longo'),
  complement: z.string().max(100, 'Complemento muito longo').optional(),
  phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(15, 'Telefone inválido'),
});

interface Address {
  id: string;
  label: string;
  cep: string;
  street: string;
  city: string;
  number: string;
  complement: string | null;
  phone: string;
  is_default: boolean;
}

interface AddressForm {
  label: string;
  cep: string;
  street: string;
  city: string;
  number: string;
  complement: string;
  phone: string;
}

const labelOptions = [
  { value: 'Casa', icon: Home },
  { value: 'Trabalho', icon: Briefcase },
  { value: 'Outro', icon: Heart },
];

const MAX_ADDRESSES = 3;

const Addresses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>({
    label: 'Casa',
    cep: '',
    street: '',
    city: '',
    number: '',
    complement: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<AddressForm>>({});

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      setAddresses(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      label: 'Casa',
      cep: '',
      street: '',
      city: '',
      number: '',
      complement: '',
      phone: '',
    });
    setErrors({});
    setEditingAddress(null);
  };

  const openAddDialog = () => {
    if (addresses.length >= MAX_ADDRESSES) {
      toast({
        title: 'Limite atingido',
        description: `Você pode cadastrar no máximo ${MAX_ADDRESSES} endereços`,
        variant: 'destructive',
      });
      return;
    }
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setForm({
      label: address.label,
      cep: address.cep,
      street: address.street,
      city: address.city,
      number: address.number,
      complement: address.complement || '',
      phone: address.phone,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleInputChange = (field: keyof AddressForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSave = async () => {
    if (!user) return;

    const result = addressSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<AddressForm> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof AddressForm;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);

    const addressData = {
      user_id: user.id,
      label: form.label,
      cep: form.cep,
      street: form.street,
      city: form.city,
      number: form.number,
      complement: form.complement || null,
      phone: form.phone,
      is_default: addresses.length === 0,
    };

    let error;

    if (editingAddress) {
      const { error: updateError } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', editingAddress.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('addresses')
        .insert(addressData);
      error = insertError;
    }

    setSaving(false);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o endereço',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Sucesso!',
      description: editingAddress ? 'Endereço atualizado' : 'Endereço adicionado',
    });
    
    setIsDialogOpen(false);
    resetForm();
    fetchAddresses();
  };

  const handleDelete = async () => {
    if (!deleteAddressId) return;

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', deleteAddressId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o endereço',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Endereço excluído',
        description: 'O endereço foi removido com sucesso',
      });
      fetchAddresses();
    }
    
    setDeleteAddressId(null);
  };

  const setAsDefault = async (addressId: string) => {
    if (!user) return;

    // First, unset all defaults
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // Then set the new default
    await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId);

    toast({
      title: 'Endereço padrão atualizado',
    });
    
    fetchAddresses();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-card border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft size={24} className="text-foreground" />
              </Link>
              <h1 className="font-display font-bold text-xl text-foreground">Endereços</h1>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center px-4 py-20">
          <MapPin size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-6">Faça login para gerenciar seus endereços</p>
          <Button onClick={() => navigate('/auth')} className="gradient-hero text-primary-foreground">
            Fazer Login
          </Button>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft size={24} className="text-foreground" />
              </Link>
              <h1 className="font-display font-bold text-xl text-foreground">Endereços</h1>
            </div>
            <span className="text-sm text-muted-foreground">{addresses.length}/{MAX_ADDRESSES}</span>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-secondary rounded-2xl h-32" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <MapPin size={36} className="text-muted-foreground" />
            </div>
            <h2 className="font-bold text-lg text-foreground mb-2">Nenhum endereço cadastrado</h2>
            <p className="text-muted-foreground mb-6">Adicione um endereço para facilitar suas entregas</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {addresses.map((address, index) => {
                const LabelIcon = labelOptions.find(l => l.value === address.label)?.icon || Home;
                return (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-1 ${
                          address.is_default ? 'bg-primary/10' : 'bg-secondary'
                        }`}>
                          <LabelIcon size={20} className={address.is_default ? 'text-primary' : 'text-muted-foreground'} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground">{address.label}</span>
                            {address.is_default && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                Padrão
                              </span>
                            )}
                          </div>
                          <p className="text-foreground text-sm">
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </p>
                          <p className="text-muted-foreground text-sm">{address.city} - CEP: {address.cep}</p>
                          <p className="text-muted-foreground text-sm mt-1">📞 {address.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!address.is_default && (
                          <button
                            onClick={() => setAsDefault(address.id)}
                            className="p-2 rounded-xl hover:bg-secondary transition-colors"
                            title="Definir como padrão"
                          >
                            <Check size={18} className="text-muted-foreground" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditDialog(address)}
                          className="p-2 rounded-xl hover:bg-secondary transition-colors"
                        >
                          <Edit2 size={18} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setDeleteAddressId(address.id)}
                          className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={18} className="text-destructive" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {addresses.length < MAX_ADDRESSES && (
          <Button 
            onClick={openAddDialog}
            className="w-full mt-6 gradient-hero text-primary-foreground font-bold rounded-xl shadow-glow"
          >
            <Plus size={20} className="mr-2" />
            Adicionar Endereço
          </Button>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Editar Endereço' : 'Novo Endereço'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Label Selection */}
            <div className="space-y-2">
              <Label>Tipo de endereço</Label>
              <div className="flex gap-2">
                {labelOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('label', option.value)}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      form.label === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <option.icon size={18} className={form.label === option.value ? 'text-primary' : 'text-muted-foreground'} />
                    <span className={`text-sm font-medium ${form.label === option.value ? 'text-primary' : 'text-foreground'}`}>
                      {option.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={form.cep}
                  onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className={errors.cep ? 'border-destructive' : ''}
                />
                {errors.cep && <p className="text-destructive text-xs">{errors.cep}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Sua cidade"
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && <p className="text-destructive text-xs">{errors.city}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                value={form.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Nome da rua"
                className={errors.street ? 'border-destructive' : ''}
              />
              {errors.street && <p className="text-destructive text-xs">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  value={form.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  placeholder="123"
                  className={errors.number ? 'border-destructive' : ''}
                />
                {errors.number && <p className="text-destructive text-xs">{errors.number}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={form.complement}
                  onChange={(e) => handleInputChange('complement', e.target.value)}
                  placeholder="Apto, bloco..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gradient-hero text-primary-foreground font-bold rounded-xl mt-4"
            >
              {saving ? 'Salvando...' : 'Salvar Endereço'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAddressId} onOpenChange={() => setDeleteAddressId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir endereço?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O endereço será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default Addresses;
