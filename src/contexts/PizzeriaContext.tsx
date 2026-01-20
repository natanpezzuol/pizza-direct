import React, { createContext, useContext, ReactNode } from 'react';

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
}

const defaultConfig: PizzeriaConfig = {
  name: "Bella Napoli",
  logo: "",
  banner: "",
  address: "Rua das Pizzas, 123 - Centro",
  phone: "(11) 99999-9999",
  openingHours: "18:00 - 23:30",
  deliveryTime: "30-45 min",
  minimumOrder: 30,
  deliveryFee: 5.99,
  primaryColor: "#E85D04",
};

const PizzeriaContext = createContext<PizzeriaConfig>(defaultConfig);

export const PizzeriaProvider = ({ children, config }: { children: ReactNode; config?: Partial<PizzeriaConfig> }) => {
  const mergedConfig = { ...defaultConfig, ...config };
  
  return (
    <PizzeriaContext.Provider value={mergedConfig}>
      {children}
    </PizzeriaContext.Provider>
  );
};

export const usePizzeria = () => {
  return useContext(PizzeriaContext);
};
