import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface QRScannerScreenProps {
  route: {
    params?: {
      type?: 'entry' | 'exit';
      plazaId?: string;
    };
  };
  navigation: any;
}

const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ route, navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { type = 'entry', plazaId } = route.params || {};

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type: barcodeType, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    try {
      // Check if it's an AXS access point QR (new format: axs://ap/<publicId>)
      if (data.startsWith('axs://ap/')) {
        const accessPointPublicId = data.replace('axs://ap/', '');
        await handleAccessPointQR(accessPointPublicId);
        return;
      }

      // Legacy: Try to parse as JSON for old QR formats
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'axs-parking' || qrData.type === 'axs-pass') {
        await handleAXSQR(qrData);
      } else {
        handleGenericQR(data);
      }
    } catch (error) {
      // Check if it might be an access point publicId directly
      if (data.match(/^[a-zA-Z0-9-_]+$/)) {
        await handleAccessPointQR(data);
      } else if (data.startsWith('AXS_')) {
        // Legacy pass consumption
        await consumePass(data);
      } else {
        handleGenericQR(data);
      }
    }
  };

  const handleAccessPointQR = async (accessPointPublicId: string) => {
    try {
      // Get access point information and flow
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/access-points/${accessPointPublicId}`);
      
      if (!response.ok) {
        Alert.alert('Error', 'Punto de acceso no encontrado', [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
        return;
      }

      const accessPoint = await response.json();
      
      // Navigate to flow screen (or create a new FlowScreen component)
      navigation.navigate('AccessPointFlow', {
        accessPoint,
        accessPointPublicId,
      });

    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  const consumePass = async (passId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/passes/${passId}/consume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Agregar JWT token si está disponible
        },
      });

      if (response.ok) {
        // Haptics feedback de éxito
        navigation.replace('QRResult', { 
          status: 'consumed', 
          passId,
          message: 'Pase consumido exitosamente' 
        });
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'No se pudo consumir el pase', [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  const handleAXSQR = async (qrData: any) => {
    if (qrData.type === 'axs-pass' && qrData.passId) {
      // QR de pase - consumir directamente
      await consumePass(qrData.passId);
      return;
    }

    if (type === 'entry') {
      // QR de entrada - navegar a parking con datos
      navigation.navigate('Parking', {
        qrData,
        entryTime: new Date().toISOString(),
        plazaId: qrData.plazaId || plazaId,
      });
    } else {
      // QR de salida - calcular tarifa y ir a pago
      const entryTime = qrData.entryTime || new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const exitTime = new Date().toISOString();
      
      navigation.navigate('Parking', {
        qrData,
        entryTime,
        exitTime,
        plazaId: qrData.plazaId || plazaId,
        showPayment: true,
      });
    }
  };

  const handleGenericQR = (data: string) => {
    Alert.alert(
      'QR Escaneado',
      `Contenido: ${data}`,
      [
        { text: 'Escanear otro', onPress: () => setScanned(false) },
        { text: 'Cerrar', onPress: () => navigation.goBack() },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No hay acceso a la cámara</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea} />
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay} />
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          {type === 'entry' ? 'Escanea el QR de entrada' : 'Escanea el QR de salida'}
        </Text>
        <Text style={styles.subInstructionText}>
          Coloca el código QR dentro del marco
        </Text>
      </View>

      {scanned && (
        <View style={styles.scannedContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.buttonText}>Escanear de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: scanAreaSize,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  instructionContainer: {
    position: 'absolute',
    top: height * 0.15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstructionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  scannedContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default QRScannerScreen;
