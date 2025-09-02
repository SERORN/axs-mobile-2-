import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService, PricingRule } from "../services/api";

interface PricingContextProps {
  pricing: PricingRule[] | null;
  refresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const PricingContext = createContext<PricingContextProps>({
  pricing: null,
  refresh: async () => {},
  loading: false,
  error: null,
});

export const usePricing = () => useContext(PricingContext);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pricing, setPricing] = useState<PricingRule[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.pricing.getPublicPricing();
      setPricing(data);
    } catch (e) {
      console.error("Pricing fetch error", e);
      setError("No se pudo cargar la configuración de precios");
      
      // Usar datos por defecto en caso de error
      setPricing([
        {
          industry: "parking",
          plaza: "angelopolis",
          config: {
            name: "Angelópolis",
            graceMinutes: 15,
            defaultRate: 20,
            currency: "MXN",
            plazaId: "angelopolis",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  return (
    <PricingContext.Provider value={{ 
      pricing, 
      refresh: fetchPricing,
      loading,
      error 
    }}>
      {children}
    </PricingContext.Provider>
  );
};
