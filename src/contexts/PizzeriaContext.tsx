import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PizzeriaConfig {
  name: string;
  logo: string;
  banner: string;
  address: string;
  phone: string;
  openingHours: string;
  deliveryTime: string;
  minimumOrder: number;
  deliveryFee: number;
  primaryColor: string;
  isOpen: boolean;
}

const defaultConfig: PizzeriaConfig = {
  name: "Carregando...",
  logo: "",
  banner: "",
  address: "",
  phone: "",
  openingHours: "",
  deliveryTime: "30-45 min",
  minimumOrder: 30,
  deliveryFee: 5.99,
  primaryColor: "#E85D04",
  isOpen: true,
};

interface PizzeriaContextType {
  config: PizzeriaConfig;
  loading: boolean;
  refetch: () => Promise<void>;
}

const PizzeriaContext = createContext<PizzeriaContextType>({
  config: defaultConfig,
  loading: true,
  refetch: async () => {},
});

export const PizzeriaProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<PizzeriaConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pizzeria_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setConfig({
          name: data.name,
          logo: "",
          banner: "",
          address: data.address,
          phone: data.phone,
          openingHours: data.opening_hours,
          deliveryTime: data.delivery_time,
          minimumOrder: Number(data.minimum_order),
          deliveryFee: Number(data.delivery_fee),
          primaryColor: data.primary_color,
          isOpen: data.is_open,
        });
      }
    } catch (error) {
      console.error('Error fetching pizzeria settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <PizzeriaContext.Provider value={{ config, loading, refetch: fetchSettings }}>
      {children}
    </PizzeriaContext.Provider>
  );
};

export const usePizzeria = () => {
  const context = useContext(PizzeriaContext);
  // Return config directly for backward compatibility
  return {
    ...context.config,
    loading: context.loading,
    refetch: context.refetch,
  };
};
