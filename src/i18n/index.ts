import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traducciones
const resources = {
  'es-MX': {
    translation: {
      // Común
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      accept: 'Aceptar',
      back: 'Atrás',
      next: 'Siguiente',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      
      // Auth
      welcomeTitle: 'Bienvenido a AXS',
      phoneNumber: 'Número de teléfono',
      enterPhone: 'Ingresa tu número de teléfono',
      sendCode: 'Enviar código',
      verificationCode: 'Código de verificación',
      enterCode: 'Ingresa el código que recibiste',
      verify: 'Verificar',
      
      // Industrias
      selectIndustry: 'Selecciona tu industria',
      parking: 'Estacionamiento',
      residential: 'Residencial',
      corporate: 'Corporativo',
      lounges: 'Lounges',
      tollbooths: 'Casetas',
      
      // Estacionamiento
      parkingTitle: 'Estacionamiento',
      plaza: 'Plaza',
      entry: 'Entrada',
      exit: 'Salida',
      duration: 'Duración',
      calculateFee: 'Calcular Tarifa',
      totalToPay: 'Total a pagar',
      pay: 'Pagar',
      free: 'GRATIS',
      gracePeriod: 'Período de gracia',
      scanQR: '📱 Escanear QR',
      viewPass: '🎫 Ver mi pase',
      
      // Pago
      paymentSummary: 'Resumen de Pago',
      paymentSuccess: '¡Pago exitoso!',
      paymentFailed: 'Pago fallido',
      processing: 'Procesando pago...',
      
      // QR
      scanEntryQR: 'Escanea el QR de entrada',
      scanExitQR: 'Escanea el QR de salida',
      placeQRInFrame: 'Coloca el código QR dentro del marco',
      scanAgain: 'Escanear de nuevo',
      
      // Monedas
      currency: {
        MXN: 'MXN',
        ARS: 'ARS',
      },
    },
  },
  'es-AR': {
    translation: {
      // Común
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      accept: 'Aceptar',
      back: 'Atrás',
      next: 'Siguiente',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      
      // Auth
      welcomeTitle: 'Bienvenido a AXS',
      phoneNumber: 'Número de teléfono',
      enterPhone: 'Ingresá tu número de teléfono',
      sendCode: 'Enviar código',
      verificationCode: 'Código de verificación',
      enterCode: 'Ingresá el código que recibiste',
      verify: 'Verificar',
      
      // Industrias
      selectIndustry: 'Seleccioná tu industria',
      parking: 'Estacionamiento',
      residential: 'Residencial',
      corporate: 'Corporativo',
      lounges: 'Lounges',
      tollbooths: 'Peajes',
      
      // Estacionamiento
      parkingTitle: 'Estacionamiento',
      plaza: 'Plaza',
      entry: 'Entrada',
      exit: 'Salida',
      duration: 'Duración',
      calculateFee: 'Calcular Tarifa',
      totalToPay: 'Total a pagar',
      pay: 'Pagar',
      free: 'GRATIS',
      gracePeriod: 'Período de gracia',
      scanQR: '📱 Escanear QR',
      viewPass: '🎫 Ver mi pase',
      
      // Pago
      paymentSummary: 'Resumen de Pago',
      paymentSuccess: '¡Pago exitoso!',
      paymentFailed: 'Pago fallido',
      processing: 'Procesando pago...',
      
      // QR
      scanEntryQR: 'Escaneá el QR de entrada',
      scanExitQR: 'Escaneá el QR de salida',
      placeQRInFrame: 'Colocá el código QR dentro del marco',
      scanAgain: 'Escanear de nuevo',
      
      // Monedas
      currency: {
        MXN: 'MXN',
        ARS: 'ARS',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es-MX', // idioma por defecto
    fallbackLng: 'es-MX',
    
    interpolation: {
      escapeValue: false,
    },
    
    // Detectar idioma basado en configuración del dispositivo
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
