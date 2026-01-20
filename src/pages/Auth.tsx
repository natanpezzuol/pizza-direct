import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pizza, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePizzeria } from '@/contexts/PizzeriaContext';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

const signupSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const modeFromUrl = searchParams.get('mode');
  
  const [mode, setMode] = useState<AuthMode>(modeFromUrl === 'reset' ? 'reset' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signIn, signUp, resetPassword, updatePassword } = useAuth();
  const pizzeria = usePizzeria();

  useEffect(() => {
    if (!loading && user && mode !== 'reset') {
      navigate('/');
    }
  }, [user, loading, navigate, mode]);

  useEffect(() => {
    if (modeFromUrl === 'reset') {
      setMode('reset');
    }
  }, [modeFromUrl]);

  const validateForm = () => {
    try {
      if (mode === 'login') {
        loginSchema.parse({ email: formData.email, password: formData.password });
      } else if (mode === 'signup') {
        signupSchema.parse(formData);
      } else if (mode === 'forgot') {
        z.string().email('Email inválido').parse(formData.email);
      } else if (mode === 'reset') {
        resetPasswordSchema.parse({ password: formData.password, confirmPassword: formData.confirmPassword });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          } else {
            newErrors['email'] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Erro no login',
              description: 'Email ou senha incorretos',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Erro no login',
              description: error.message,
              variant: 'destructive'
            });
          }
          return;
        }

        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso'
        });
        navigate('/');
      } else if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: 'Erro no cadastro',
              description: 'Este email já está cadastrado. Tente fazer login.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Erro no cadastro',
              description: error.message,
              variant: 'destructive'
            });
          }
          return;
        }

        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar o cadastro'
        });
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(formData.email);
        
        if (error) {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: 'Email enviado!',
          description: 'Verifique sua caixa de entrada para redefinir a senha'
        });
        setMode('login');
      } else if (mode === 'reset') {
        const { error } = await updatePassword(formData.password);
        
        if (error) {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: 'Senha alterada!',
          description: 'Sua senha foi atualizada com sucesso'
        });
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Pizza className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Entre na sua conta';
      case 'signup': return 'Crie sua conta';
      case 'forgot': return 'Recuperar senha';
      case 'reset': return 'Nova senha';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return 'Entrar';
      case 'signup': return 'Criar conta';
      case 'forgot': return 'Enviar email';
      case 'reset': return 'Alterar senha';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => mode === 'forgot' ? switchMode('login') : navigate('/')}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-8 text-center"
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: pizzeria.primaryColor + '20' }}
          >
            <Pizza className="w-10 h-10" style={{ color: pizzeria.primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{pizzeria.name}</h1>
          <p className="text-muted-foreground mt-1">{getTitle()}</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4"
        >
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
            <div className="space-y-2">
              <Label htmlFor="password">{mode === 'reset' ? 'Nova Senha' : 'Senha'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          )}

          {(mode === 'signup' || mode === 'reset') && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-sm hover:underline"
                style={{ color: pizzeria.primaryColor }}
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <p className="text-sm text-muted-foreground text-center">
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-lg font-semibold"
            style={{ backgroundColor: pizzeria.primaryColor }}
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Pizza className="w-5 h-5" />
              </motion.div>
            ) : (
              getButtonText()
            )}
          </Button>
        </motion.form>

        {(mode === 'login' || mode === 'signup') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="font-semibold hover:underline"
              style={{ color: pizzeria.primaryColor }}
            >
              {mode === 'login' ? 'Criar conta' : 'Fazer login'}
            </button>
          </motion.div>
        )}

        {mode === 'forgot' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="font-semibold hover:underline"
              style={{ color: pizzeria.primaryColor }}
            >
              Voltar para login
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Auth;
