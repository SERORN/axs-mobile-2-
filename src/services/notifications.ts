import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationService {
  requestPermissions(): Promise<boolean>;
  getExpoPushToken(): Promise<string | null>;
  scheduleLocalNotification(title: string, body: string, data?: any): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  addNotificationListener(callback: (notification: any) => void): void;
  addNotificationResponseListener(callback: (response: any) => void): void;
}

class NotificationServiceImpl implements NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;

  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permission not granted for push notifications');
        return false;
      }

      // Configurar canal de notificación para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async getExpoPushToken(): Promise<string | null> {
    try {
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      return token.data;
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  async scheduleLocalNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Mostrar inmediatamente
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  addNotificationListener(callback: (notification: any) => void): void {
    this.notificationListener = Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseListener(callback: (response: any) => void): void {
    this.responseListener = Notifications.addNotificationResponseReceivedListener(callback);
  }

  removeListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

// Hook para usar notificaciones
export const useNotifications = () => {
  const notificationService = new NotificationServiceImpl();

  const initializeNotifications = async () => {
    const token = await notificationService.getExpoPushToken();
    
    if (token) {
      // Aquí enviarías el token al backend
      console.log('Expo Push Token:', token);
      // await apiService.user.savePushToken(token);
    }

    // Configurar listeners
    notificationService.addNotificationListener((notification) => {
      console.log('Notification received:', notification);
      
      // Manejar notificación recibida
      const { title, body, data } = notification.request.content;
      
      // Ejemplo: si es una notificación de pago exitoso
      if (data?.type === 'payment_success') {
        // Actualizar estado de la app, navegar, etc.
      }
    });

    notificationService.addNotificationResponseListener((response) => {
      console.log('Notification response:', response);
      
      // Manejar respuesta a notificación (cuando el usuario la toca)
      const { data } = response.notification.request.content;
      
      if (data?.screen) {
        // Navegar a pantalla específica
        // navigation.navigate(data.screen, data.params);
      }
    });

    return token;
  };

  const sendLocalNotification = async (
    title: string, 
    body: string, 
    data?: any
  ) => {
    await notificationService.scheduleLocalNotification(title, body, data);
  };

  const requestPermissions = async () => {
    return await notificationService.requestPermissions();
  };

  return {
    initializeNotifications,
    sendLocalNotification,
    requestPermissions,
    cancelAllNotifications: notificationService.cancelAllNotifications.bind(notificationService),
  };
};

// Tipos de notificaciones que maneja la app
export const NotificationTypes = {
  PAYMENT_SUCCESS: 'payment_success',
  PASS_CREATED: 'pass_created',
  PASS_EXPIRED: 'pass_expired',
  PARKING_REMINDER: 'parking_reminder',
  VISITOR_ARRIVED: 'visitor_arrived',
} as const;

// Plantillas de notificaciones
export const NotificationTemplates = {
  paymentSuccess: (amount: string, plaza: string) => ({
    title: '✅ Pago exitoso',
    body: `Tu pago de ${amount} en ${plaza} ha sido procesado correctamente`,
    data: { type: NotificationTypes.PAYMENT_SUCCESS },
  }),

  passCreated: (type: string, plaza: string) => ({
    title: '🎫 Pase creado',
    body: `Tu pase de ${type} para ${plaza} está listo`,
    data: { type: NotificationTypes.PASS_CREATED },
  }),

  passExpiring: (type: string, minutes: number) => ({
    title: '⏰ Pase por expirar',
    body: `Tu pase de ${type} expira en ${minutes} minutos`,
    data: { type: NotificationTypes.PASS_EXPIRED },
  }),

  parkingReminder: (plaza: string, hours: number) => ({
    title: '🚗 Recordatorio de estacionamiento',
    body: `Llevas ${hours} horas estacionado en ${plaza}`,
    data: { type: NotificationTypes.PARKING_REMINDER },
  }),

  visitorArrived: (guestName: string) => ({
    title: '👋 Visitante en puerta',
    body: `${guestName} ha llegado y está esperando acceso`,
    data: { type: NotificationTypes.VISITOR_ARRIVED },
  }),
};

export default NotificationServiceImpl;
