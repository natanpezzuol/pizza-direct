import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, Check } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { z } from 'zod';

const addressSchema = z.object({
  cep: z.string().min(8, 'CEP deve ter 8 dígitos').max(9, 'CEP inválido'),
  street: z.string().min(3, 'Rua é obrigatória').max(200, 'Rua muito longa'),
  city: z.string().min(2, 'Cidade é obrigatória').max(100, 'Cidade muito longa'),
  number: z.string().min(1, 'Número é obrigatório').max(20, 'Número muito longo'),
  complement: z.string().max(100, 'Complemento muito longo').optional(),
  phone: z.string().min(10, 'Telefone deve ter no mínimo 10 dígitos').max(15, 'Telefone inválido'),
});

interface AddressForm {
  cep: string;
  street: string;
  city: string;
  number: string;
  complement: string;
  phone: string;
}

const Addresses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<{
    address: string | null;
    phone: string | null;
  } | null>(null);
  const [form, setForm] = useState<AddressForm>({
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
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('address, phone')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfileData(data);
      // Parse address if it exists
      if (data.address) {
        try {
          const parsed = JSON.parse(data.address);
          setForm({
            cep: parsed.cep || '',
            street: parsed.street || '',
            city: parsed.city || '',
            number: parsed.number || '',
            complement: parsed.complement || '',
            phone: data.phone || parsed.phone || '',
          });
        } catch {
          // If not JSON, use as is
          setForm(prev => ({ ...prev, phone: data.phone || '' }));
        }
      } else if (data.phone) {
        setForm(prev => ({ ...prev, phone: data.phone || '' }));
      }
    }
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
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para salvar o endereço',
        variant: 'destructive',
      });
      return;
    }

    // Validate form
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

    setLoading(true);
    
    const addressData = JSON.stringify({
      cep: form.cep,
      street: form.street,
      city: form.city,
      number: form.number,
      complement: form.complement,
      phone: form.phone,
    });

    const { error } = await supabase
      .from('profiles')
      .update({
        address: addressData,
        phone: form.phone,
      })
      .eq('id', user.id);

    setLoading(false);

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
      description: 'Endereço salvo com sucesso',
    });
    
    setIsDialogOpen(false);
    fetchProfile();
  };

  const hasAddress = profileData?.address && profileData.address !== 'null';
  let parsedAddress: AddressForm | null = null;
  
  if (hasAddress) {
    try {
      parsedAddress = JSON.parse(profileData.address!);
    } catch {
      parsedAddress = null;
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-card border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft size={24} className="text-foreground" />
              </Link>
              <h1 className="font-display font-bold text-xl text-foreground">
                Endereços
              </h1>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center px-4 py-20">
          <MapPin size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-6">
            Faça login para gerenciar seus endereços
          </p>
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
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft size={24} className="text-foreground" />
            </Link>
            <h1 className="font-display font-bold text-xl text-foreground">
              Endereços
            </h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Current Address */}
        {parsedAddress ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 shadow-card mb-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground">Endereço Principal</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Padrão
                    </span>
                  </div>
                  <p className="text-foreground">
                    {parsedAddress.street}, {parsedAddress.number}
                    {parsedAddress.complement && ` - ${parsedAddress.complement}`}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {parsedAddress.city} - CEP: {parsedAddress.cep}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    📞 {parsedAddress.phone}
                  </p>
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="p-2 rounded-xl hover:bg-secondary transition-colors">
                    <Edit2 size={18} className="text-muted-foreground" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Editar Endereço</DialogTitle>
                  </DialogHeader>
                  <AddressFormContent
                    form={form}
                    errors={errors}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSave={handleSave}
                    formatCEP={formatCEP}
                    formatPhone={formatPhone}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <MapPin size={36} className="text-muted-foreground" />
            </div>
            <h2 className="font-bold text-lg text-foreground mb-2">
              Nenhum endereço cadastrado
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione um endereço para facilitar suas entregas
            </p>
          </motion.div>
        )}

        {/* Add Address Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full gradient-hero text-primary-foreground font-bold rounded-xl shadow-glow"
            >
              <Plus size={20} className="mr-2" />
              {parsedAddress ? 'Editar Endereço' : 'Adicionar Endereço'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {parsedAddress ? 'Editar Endereço' : 'Novo Endereço'}
              </DialogTitle>
            </DialogHeader>
            <AddressFormContent
              form={form}
              errors={errors}
              loading={loading}
              onInputChange={handleInputChange}
              onSave={handleSave}
              formatCEP={formatCEP}
              formatPhone={formatPhone}
            />
          </DialogContent>
        </Dialog>
      </div>

      <BottomNav />
    </div>
  );
};

interface AddressFormContentProps {
  form: AddressForm;
  errors: Partial<AddressForm>;
  loading: boolean;
  onInputChange: (field: keyof AddressForm, value: string) => void;
  onSave: () => void;
  formatCEP: (value: string) => string;
  formatPhone: (value: string) => string;
}

const AddressFormContent: React.FC<AddressFormContentProps> = ({
  form,
  errors,
  loading,
  onInputChange,
  onSave,
  formatCEP,
  formatPhone,
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cep">CEP *</Label>
          <Input
            id="cep"
            value={form.cep}
            onChange={(e) => onInputChange('cep', formatCEP(e.target.value))}
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
            onChange={(e) => onInputChange('city', e.target.value)}
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
          onChange={(e) => onInputChange('street', e.target.value)}
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
            onChange={(e) => onInputChange('number', e.target.value)}
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
            onChange={(e) => onInputChange('complement', e.target.value)}
            placeholder="Apto, bloco..."
            className={errors.complement ? 'border-destructive' : ''}
          />
          {errors.complement && <p className="text-destructive text-xs">{errors.complement}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone para Contato *</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => onInputChange('phone', formatPhone(e.target.value))}
          placeholder="(00) 00000-0000"
          maxLength={15}
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
      </div>

      <Button
        onClick={onSave}
        disabled={loading}
        className="w-full gradient-hero text-primary-foreground font-bold rounded-xl mt-4"
      >
        {loading ? 'Salvando...' : 'Salvar Endereço'}
      </Button>
    </div>
  );
};

export default Addresses;
