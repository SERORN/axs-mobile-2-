import Constants from 'expo-constants';

// Variables de entorno tipadas
interface EnvConfig {
  API_BASE_URL: string;
  STRIPE_PUBLISHABLE_KEY: string;
  EXPO_PROJECT_ID?: string;
  NODE_ENV: 'development' | 'staging' | 'production';
}

// Configuración por entorno
const getConfig = (): EnvConfig => {
  const isDev = __DEV__;
  const manifest = Constants.expoConfig;
  
  // Variables desde expo config o variables de entorno
  const config: EnvConfig = {
    API_BASE_URL: 
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      manifest?.extra?.apiBaseUrl ||
      (isDev 
        ? 'http://localhost:3001/api' 
        : 'https://api.axs.com/api'
      ),
    
    STRIPE_PUBLISHABLE_KEY: 
      process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      manifest?.extra?.stripePublishableKey ||
      'pk_test_51RksRXRuYeJvIyjzNtyrtPcnBjbxwSFCApPF1OIXodqnAvBzq44v0uBccG34dscU5HXzEg1x8Ca1PstV0iipyHjL00VONKZapi',
    
    EXPO_PROJECT_ID: manifest?.extra?.eas?.projectId,
    
    NODE_ENV: isDev ? 'development' : 'production',
  };

  return config;
};

export const ENV = getConfig();

// Helpers para validar configuración
export const validateConfig = () => {
  const required = ['API_BASE_URL', 'STRIPE_PUBLISHABLE_KEY'];
  const missing = required.filter(key => !ENV[key as keyof EnvConfig]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
};

export default ENV;
