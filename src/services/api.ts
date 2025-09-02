import axios from 'axios';
import ENV from '../config/env';

// Configuración base de axios
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar el token de autenticación si está disponible
    const token = ''; // Obtener del contexto de auth
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interfaces
export interface PricingRule {
  industry: string;
  plaza?: string;
  config: {
    name: string;
    graceMinutes: number;
    defaultRate: number;
    currency: string;
    plazaId: string;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  ephemeralKey: string;
  customer: string;
  amount: number;
}

export interface PassData {
  id: string;
  type: 'parking' | 'access' | 'visitor';
  plazaId: string;
  plazaName: string;
  entryTime?: string;
  exitTime?: string;
  amount?: number;
  status: 'active' | 'used' | 'expired';
  vehicleId?: string;
  guestName?: string;
}

// Servicios de API
export const apiService = {
  // Auth services
  auth: {
    requestOTP: async (phone: string) => {
      const response = await apiClient.post('/auth/request-otp', { phone });
      return response.data;
    },
    
    verifyOTP: async (phone: string, code: string) => {
      const response = await apiClient.post('/auth/verify-otp', { phone, code });
      return response.data;
    },
  },

  // Pricing services
  pricing: {
    getPublicPricing: async (): Promise<PricingRule[]> => {
      try {
        const response = await apiClient.get('/public/pricing');
        return response.data;
      } catch (error) {
        console.error('Error fetching pricing:', error);
        // Fallback data para desarrollo
        return [
          {
            industry: 'parking',
            plaza: 'angelopolis',
            config: {
              name: 'Angelópolis',
              graceMinutes: 15,
              defaultRate: 20,
              currency: 'MXN',
              plazaId: 'angelopolis',
            },
          },
          {
            industry: 'parking', 
            plaza: 'santa-fe',
            config: {
              name: 'Santa Fe',
              graceMinutes: 10,
              defaultRate: 25,
              currency: 'MXN',
              plazaId: 'santa-fe',
            },
          },
        ];
      }
    },
  },

  // Payment services
  payments: {
    createPaymentIntent: async (
      amount: number,
      currency: string,
      plazaId: string,
      passId?: string
    ): Promise<PaymentIntentResponse> => {
      try {
        const response = await apiClient.post('/payments/intent', {
          amount: Math.round(amount * 100), // Convertir a centavos
          currency,
          plazaId,
          passId,
        });
        return response.data;
      } catch (error) {
        console.error('Error creating payment intent:', error);
        throw new Error('No se pudo procesar el pago. Intenta de nuevo.');
      }
    },

    confirmPayment: async (paymentIntentId: string) => {
      const response = await apiClient.post(`/payments/${paymentIntentId}/confirm`);
      return response.data;
    },
  },

  // Pass services
  passes: {
    createPass: async (passData: Partial<PassData>): Promise<PassData> => {
      try {
        const response = await apiClient.post('/passes', passData);
        return response.data;
      } catch (error) {
        console.error('Error creating pass:', error);
        // Mock response para desarrollo
        return {
          id: `PASS-${Date.now()}`,
          type: passData.type || 'parking',
          plazaId: passData.plazaId || 'angelopolis',
          plazaName: passData.plazaName || 'Angelópolis',
          entryTime: passData.entryTime || new Date().toISOString(),
          status: 'active',
          ...passData,
        } as PassData;
      }
    },

    getPass: async (passId: string): Promise<PassData> => {
      const response = await apiClient.get(`/passes/${passId}`);
      return response.data;
    },

    consumePass: async (passId: string) => {
      const response = await apiClient.post(`/passes/${passId}/consume`);
      return response.data;
    },

    getUserPasses: async (): Promise<PassData[]> => {
      try {
        const response = await apiClient.get('/passes');
        return response.data;
      } catch (error) {
        console.error('Error fetching user passes:', error);
        return [];
      }
    },
  },

  // Plaza services
  plazas: {
    getPlazas: async () => {
      const response = await apiClient.get('/plazas');
      return response.data;
    },

    getPlazaById: async (plazaId: string) => {
      const response = await apiClient.get(`/plazas/${plazaId}`);
      return response.data;
    },
  },
};

export default apiService;
