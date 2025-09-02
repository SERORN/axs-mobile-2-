import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator 
} from "react-native";
import dayjs from "dayjs";
import { calculateParkingFee } from "../utils/parking";
import { usePricing } from "../contexts/PricingContext";

interface ParkingScreenProps {
  route: {
    params?: {
      qrData?: any;
      entryTime?: string;
      exitTime?: string;
      plazaId?: string;
      showPayment?: boolean;
      paymentSuccess?: boolean;
    };
  };
  navigation: any;
}

const ParkingScreen: React.FC<ParkingScreenProps> = ({ route, navigation }) => {
  const { pricing } = usePricing();
  const [entry, setEntry] = useState<string>("");
  const [exit, setExit] = useState<string>("");
  const [fee, setFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [plazaConfig, setPlazaConfig] = useState({
    name: "Angelópolis",
    graceMinutes: 15,
    defaultRate: 20,
    currency: "MXN",
    plazaId: "angelopolis",
  });

  // Procesar parámetros de navegación
  useEffect(() => {
    const params = route.params;
    if (params) {
      if (params.entryTime) setEntry(params.entryTime);
      if (params.exitTime) setExit(params.exitTime);
      if (params.qrData && params.qrData.plazaId) {
        // Buscar configuración de plaza en pricing
        const plazaPricing = pricing?.find(p => p.plaza === params.qrData.plazaId);
        if (plazaPricing) {
          setPlazaConfig(prev => ({
            ...prev,
            name: plazaPricing.plaza || prev.name,
            ...plazaPricing.config,
          }));
        }
      }
      
      if (params.showPayment && params.entryTime && params.exitTime) {
        // Auto-calcular y mostrar pago
        const amount = calculateParkingFee(
          params.entryTime, 
          params.exitTime, 
          plazaConfig
        );
        setFee(amount);
      }

      if (params.paymentSuccess) {
        Alert.alert(
          '¡Pago exitoso!',
          'Tu pago ha sido procesado. Puedes salir del estacionamiento.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Valores por defecto para demo
      setEntry(dayjs().subtract(1, "hour").toISOString());
      setExit(dayjs().toISOString());
    }
  }, [route.params, pricing]);

  const handleCalc = () => {
    if (!entry || !exit) {
      Alert.alert('Error', 'Faltan datos de entrada o salida');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const amount = calculateParkingFee(entry, exit, plazaConfig);
      setFee(amount);
      setLoading(false);
    }, 500);
  };

  const handlePayment = () => {
    if (fee === null || fee <= 0) {
      Alert.alert('Sin costo', 'No hay tarifa que pagar gracias al período de gracia.');
      return;
    }

    navigation.navigate('Payment', {
      amount: fee,
      plazaId: plazaConfig.plazaId,
      plazaName: plazaConfig.name,
      currency: plazaConfig.currency?.toLowerCase() || 'mxn',
    });
  };

  const handleScanEntry = () => {
    navigation.navigate('QRScanner', { 
      type: 'entry',
      plazaId: plazaConfig.plazaId 
    });
  };

  const handleScanExit = () => {
    navigation.navigate('QRScanner', { 
      type: 'exit',
      plazaId: plazaConfig.plazaId 
    });
  };

  const handleViewQR = () => {
    const passData = {
      id: `PASS-${Date.now()}`,
      type: 'parking' as const,
      plazaId: plazaConfig.plazaId,
      plazaName: plazaConfig.name,
      entryTime: entry,
      validUntil: dayjs().add(24, 'hours').toISOString(),
    };

    navigation.navigate('QRViewer', { passData });
  };

  const formatCurrency = (amount: number) => {
    const currency = plazaConfig.currency || 'MXN';
    const locale = currency === 'MXN' ? 'es-MX' : 'es-AR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getDuration = () => {
    if (!entry || !exit) return '';
    const entryTime = dayjs(entry);
    const exitTime = dayjs(exit);
    const duration = exitTime.diff(entryTime, 'minutes');
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estacionamiento</Text>
        <Text style={styles.subtitle}>Plaza: {plazaConfig.name}</Text>
        {plazaConfig.graceMinutes > 0 && (
          <Text style={styles.graceText}>
            ⏰ Gracia: {plazaConfig.graceMinutes} minutos
          </Text>
        )}
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeCard}>
          <Text style={styles.timeLabel}>Entrada</Text>
          <Text style={styles.timeValue}>
            {entry ? dayjs(entry).format("DD/MM HH:mm") : "--:--"}
          </Text>
          <TouchableOpacity style={styles.scanButton} onPress={handleScanEntry}>
            <Text style={styles.scanButtonText}>📱 Escanear QR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeCard}>
          <Text style={styles.timeLabel}>Salida</Text>
          <Text style={styles.timeValue}>
            {exit ? dayjs(exit).format("DD/MM HH:mm") : "--:--"}
          </Text>
          <TouchableOpacity style={styles.scanButton} onPress={handleScanExit}>
            <Text style={styles.scanButtonText}>📱 Escanear QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {entry && exit && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationLabel}>Tiempo estacionado:</Text>
          <Text style={styles.durationValue}>{getDuration()}</Text>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.calculateButton, loading && styles.disabledButton]} 
          onPress={handleCalc}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.calculateButtonText}>Calcular Tarifa</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.qrButton} onPress={handleViewQR}>
          <Text style={styles.qrButtonText}>🎫 Ver mi pase</Text>
        </TouchableOpacity>
      </View>

      {fee !== null && (
        <View style={styles.feeContainer}>
          <Text style={styles.feeLabel}>Total a pagar:</Text>
          <Text style={styles.feeValue}>
            {fee > 0 ? formatCurrency(fee) : 'GRATIS'}
          </Text>
          
          {fee > 0 && (
            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
              <Text style={styles.payButtonText}>
                💳 Pagar {formatCurrency(fee)}
              </Text>
            </TouchableOpacity>
          )}

          {fee === 0 && (
            <Text style={styles.graceMessage}>
              ✅ Sin costo por período de gracia
            </Text>
          )}
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Información</Text>
        <Text style={styles.infoText}>
          • Tarifa base: {formatCurrency(plazaConfig.defaultRate)}/hora
        </Text>
        <Text style={styles.infoText}>
          • Período de gracia: {plazaConfig.graceMinutes} minutos
        </Text>
        <Text style={styles.infoText}>
          • Los pagos se procesan de forma segura
        </Text>
        <Text style={styles.infoText}>
          • Guarda tu comprobante de pago
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  graceText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  timeCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  scanButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scanButtonText: {
    fontSize: 12,
    color: '#007AFF',
  },
  durationContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  qrButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  feeContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  feeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  graceMessage: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default ParkingScreen;
