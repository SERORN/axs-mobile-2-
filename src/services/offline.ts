import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { PassData } from '../services/api';

const STORAGE_KEYS = {
  OFFLINE_PASSES: 'offline_passes',
  PENDING_OPERATIONS: 'pending_operations',
  USER_SETTINGS: 'user_settings',
};

interface PendingOperation {
  id: string;
  type: 'consume_pass' | 'create_pass' | 'payment';
  data: any;
  timestamp: string;
  retries: number;
}

interface UserSettings {
  defaultPlaza?: string;
  notifications: boolean;
  autoSync: boolean;
}

class OfflineStorageService {
  // Gestión de pases offline
  async saveOfflinePass(pass: PassData): Promise<void> {
    try {
      const existingPasses = await this.getOfflinePasses();
      const updatedPasses = [...existingPasses.filter(p => p.id !== pass.id), pass];
      
      await SecureStore.setItemAsync(
        STORAGE_KEYS.OFFLINE_PASSES,
        JSON.stringify(updatedPasses)
      );
    } catch (error) {
      console.error('Error saving offline pass:', error);
      throw new Error('No se pudo guardar el pase offline');
    }
  }

  async getOfflinePasses(): Promise<PassData[]> {
    try {
      const passesJson = await SecureStore.getItemAsync(STORAGE_KEYS.OFFLINE_PASSES);
      return passesJson ? JSON.parse(passesJson) : [];
    } catch (error) {
      console.error('Error loading offline passes:', error);
      return [];
    }
  }

  async removeOfflinePass(passId: string): Promise<void> {
    try {
      const existingPasses = await this.getOfflinePasses();
      const updatedPasses = existingPasses.filter(p => p.id !== passId);
      
      await SecureStore.setItemAsync(
        STORAGE_KEYS.OFFLINE_PASSES,
        JSON.stringify(updatedPasses)
      );
    } catch (error) {
      console.error('Error removing offline pass:', error);
    }
  }

  // Gestión de operaciones pendientes
  async addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    try {
      const pendingOps = await this.getPendingOperations();
      const newOperation: PendingOperation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        retries: 0,
        ...operation,
      };

      const updatedOps = [...pendingOps, newOperation];
      await SecureStore.setItemAsync(
        STORAGE_KEYS.PENDING_OPERATIONS,
        JSON.stringify(updatedOps)
      );
    } catch (error) {
      console.error('Error adding pending operation:', error);
    }
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    try {
      const opsJson = await SecureStore.getItemAsync(STORAGE_KEYS.PENDING_OPERATIONS);
      return opsJson ? JSON.parse(opsJson) : [];
    } catch (error) {
      console.error('Error loading pending operations:', error);
      return [];
    }
  }

  async removePendingOperation(operationId: string): Promise<void> {
    try {
      const pendingOps = await this.getPendingOperations();
      const updatedOps = pendingOps.filter(op => op.id !== operationId);
      
      await SecureStore.setItemAsync(
        STORAGE_KEYS.PENDING_OPERATIONS,
        JSON.stringify(updatedOps)
      );
    } catch (error) {
      console.error('Error removing pending operation:', error);
    }
  }

  async incrementOperationRetries(operationId: string): Promise<void> {
    try {
      const pendingOps = await this.getPendingOperations();
      const updatedOps = pendingOps.map(op => 
        op.id === operationId 
          ? { ...op, retries: op.retries + 1 }
          : op
      );
      
      await SecureStore.setItemAsync(
        STORAGE_KEYS.PENDING_OPERATIONS,
        JSON.stringify(updatedOps)
      );
    } catch (error) {
      console.error('Error incrementing operation retries:', error);
    }
  }

  // Configuración de usuario
  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }

  async getUserSettings(): Promise<UserSettings> {
    try {
      const settingsJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER_SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : {
        notifications: true,
        autoSync: true,
      };
    } catch (error) {
      console.error('Error loading user settings:', error);
      return {
        notifications: true,
        autoSync: true,
      };
    }
  }

  // Utilidades
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.OFFLINE_PASSES),
        SecureStore.deleteItemAsync(STORAGE_KEYS.PENDING_OPERATIONS),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_SETTINGS),
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  async getStorageInfo(): Promise<{
    offlinePassesCount: number;
    pendingOperationsCount: number;
    lastSync?: string;
  }> {
    try {
      const [passes, operations] = await Promise.all([
        this.getOfflinePasses(),
        this.getPendingOperations(),
      ]);

      return {
        offlinePassesCount: passes.length,
        pendingOperationsCount: operations.length,
        lastSync: new Date().toISOString(), // TODO: implementar tracking de sync
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        offlinePassesCount: 0,
        pendingOperationsCount: 0,
      };
    }
  }
}

// Hook para usar el servicio de almacenamiento offline
export const useOfflineStorage = () => {
  const storageService = new OfflineStorageService();

  const savePassOffline = async (pass: PassData) => {
    try {
      await storageService.saveOfflinePass(pass);
      Alert.alert(
        'Guardado offline',
        'El pase se ha guardado localmente y se sincronizará cuando tengas conexión.'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el pase offline');
    }
  };

  const syncPendingOperations = async () => {
    try {
      const pendingOps = await storageService.getPendingOperations();
      
      for (const operation of pendingOps) {
        if (operation.retries >= 3) {
          // Remover operaciones que fallaron muchas veces
          await storageService.removePendingOperation(operation.id);
          continue;
        }

        try {
          // Aquí iría la lógica específica para cada tipo de operación
          switch (operation.type) {
            case 'consume_pass':
              // await apiService.passes.consumePass(operation.data.passId);
              break;
            case 'create_pass':
              // await apiService.passes.createPass(operation.data);
              break;
            case 'payment':
              // await apiService.payments.confirmPayment(operation.data.paymentId);
              break;
          }

          // Si la operación fue exitosa, removerla
          await storageService.removePendingOperation(operation.id);
        } catch (error) {
          // Incrementar contador de reintentos
          await storageService.incrementOperationRetries(operation.id);
        }
      }
    } catch (error) {
      console.error('Error syncing pending operations:', error);
    }
  };

  return {
    savePassOffline,
    getOfflinePasses: storageService.getOfflinePasses.bind(storageService),
    removeOfflinePass: storageService.removeOfflinePass.bind(storageService),
    addPendingOperation: storageService.addPendingOperation.bind(storageService),
    getPendingOperations: storageService.getPendingOperations.bind(storageService),
    syncPendingOperations,
    getUserSettings: storageService.getUserSettings.bind(storageService),
    saveUserSettings: storageService.saveUserSettings.bind(storageService),
    getStorageInfo: storageService.getStorageInfo.bind(storageService),
    clearAllData: storageService.clearAllData.bind(storageService),
  };
};

export default OfflineStorageService;
