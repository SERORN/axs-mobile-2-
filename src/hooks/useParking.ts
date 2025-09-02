import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { calculateParkingFee } from '../utils/parking';
import { apiService, PassData } from '../services/api';

interface ParkingSession {
  passId?: string;
  plazaId: string;
  plazaName: string;
  entryTime: string;
  exitTime?: string;
  amount?: number;
  paid: boolean;
}

export const useParking = () => {
  const [currentSession, setCurrentSession] = useState<ParkingSession | null>(null);
  const [loading, setLoading] = useState(false);

  const startParkingSession = useCallback(async (
    plazaId: string,
    plazaName: string,
    entryTime?: string
  ) => {
    try {
      setLoading(true);
      
      const entry = entryTime || new Date().toISOString();
      
      // Crear pase en el backend
      const passData = await apiService.passes.createPass({
        type: 'parking',
        plazaId,
        plazaName,
        entryTime: entry,
      });

      const session: ParkingSession = {
        passId: passData.id,
        plazaId,
        plazaName,
        entryTime: entry,
        paid: false,
      };

      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error('Error starting parking session:', error);
      Alert.alert('Error', 'No se pudo iniciar la sesión de estacionamiento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const endParkingSession = useCallback(async (
    exitTime?: string,
    plazaConfig?: any
  ) => {
    if (!currentSession) {
      Alert.alert('Error', 'No hay una sesión activa');
      return null;
    }

    try {
      setLoading(true);
      
      const exit = exitTime || new Date().toISOString();
      const amount = plazaConfig 
        ? calculateParkingFee(currentSession.entryTime, exit, plazaConfig)
        : 0;

      const updatedSession: ParkingSession = {
        ...currentSession,
        exitTime: exit,
        amount,
      };

      setCurrentSession(updatedSession);
      return updatedSession;
    } catch (error) {
      console.error('Error ending parking session:', error);
      Alert.alert('Error', 'No se pudo finalizar la sesión');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const processPayment = useCallback(async (
    amount: number,
    currency: string,
    onSuccess?: () => void
  ) => {
    if (!currentSession) {
      Alert.alert('Error', 'No hay una sesión activa');
      return false;
    }

    try {
      setLoading(true);

      // El pago se maneja en PaymentScreen usando Stripe
      // Aquí solo marcamos como pagado después del éxito
      const updatedSession: ParkingSession = {
        ...currentSession,
        paid: true,
      };

      setCurrentSession(updatedSession);
      
      // Consumir el pase en el backend
      if (currentSession.passId) {
        await apiService.passes.consumePass(currentSession.passId);
      }

      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'No se pudo procesar el pago');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const getPassData = useCallback((): PassData | null => {
    if (!currentSession) return null;

    return {
      id: currentSession.passId || `TEMP-${Date.now()}`,
      type: 'parking',
      plazaId: currentSession.plazaId,
      plazaName: currentSession.plazaName,
      entryTime: currentSession.entryTime,
      exitTime: currentSession.exitTime,
      amount: currentSession.amount,
      status: currentSession.paid ? 'used' : 'active',
    };
  }, [currentSession]);

  return {
    currentSession,
    loading,
    startParkingSession,
    endParkingSession,
    processPayment,
    clearSession,
    getPassData,
  };
};
