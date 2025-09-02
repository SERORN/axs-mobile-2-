import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import dayjs from 'dayjs';

interface QRViewerScreenProps {
  route: {
    params: {
      passData: {
        id: string;
        type: 'parking' | 'access' | 'visitor';
        plazaId: string;
        plazaName: string;
        entryTime?: string;
        validUntil?: string;
        vehicleId?: string;
        guestName?: string;
      };
    };
  };
  navigation: any;
}

const QRViewerScreen: React.FC<QRViewerScreenProps> = ({ route, navigation }) => {
  const { passData } = route.params;

  const qrData = JSON.stringify({
    type: 'axs-parking',
    passId: passData.id,
    plazaId: passData.plazaId,
    entryTime: passData.entryTime,
    validUntil: passData.validUntil,
    vehicleId: passData.vehicleId,
    timestamp: new Date().toISOString(),
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pase AXS - ${passData.plazaName}\nID: ${passData.id}\nVálido hasta: ${
          passData.validUntil ? dayjs(passData.validUntil).format('DD/MM/YYYY HH:mm') : 'Sin límite'
        }`,
        title: 'Compartir pase AXS',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el pase');
    }
  };

  const getPassTypeTitle = () => {
    switch (passData.type) {
      case 'parking':
        return 'Pase de Estacionamiento';
      case 'access':
        return 'Pase de Acceso';
      case 'visitor':
        return 'Pase de Visitante';
      default:
        return 'Pase AXS';
    }
  };

  const getStatusColor = () => {
    if (passData.validUntil) {
      const now = dayjs();
      const validUntil = dayjs(passData.validUntil);
      
      if (now.isAfter(validUntil)) {
        return '#FF3B30'; // Rojo - Expirado
      } else if (now.add(30, 'minutes').isAfter(validUntil)) {
        return '#FF9500'; // Naranja - Por expirar
      }
    }
    return '#34C759'; // Verde - Activo
  };

  const getStatusText = () => {
    if (passData.validUntil) {
      const now = dayjs();
      const validUntil = dayjs(passData.validUntil);
      
      if (now.isAfter(validUntil)) {
        return 'EXPIRADO';
      } else if (now.add(30, 'minutes').isAfter(validUntil)) {
        return 'POR EXPIRAR';
      }
    }
    return 'ACTIVO';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getPassTypeTitle()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.qrContainer}>
        <QRCode
          value={qrData}
          size={250}
          backgroundColor="white"
          color="black"
        />
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plaza:</Text>
          <Text style={styles.detailValue}>{passData.plazaName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>ID del pase:</Text>
          <Text style={styles.detailValue}>{passData.id}</Text>
        </View>

        {passData.entryTime && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Entrada:</Text>
            <Text style={styles.detailValue}>
              {dayjs(passData.entryTime).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
        )}

        {passData.validUntil && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Válido hasta:</Text>
            <Text style={styles.detailValue}>
              {dayjs(passData.validUntil).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
        )}

        {passData.vehicleId && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehículo:</Text>
            <Text style={styles.detailValue}>{passData.vehicleId}</Text>
          </View>
        )}

        {passData.guestName && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Visitante:</Text>
            <Text style={styles.detailValue}>{passData.guestName}</Text>
          </View>
        )}
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Presenta este código QR en la entrada/salida
        </Text>
        <Text style={styles.subInstructionText}>
          El código se actualiza automáticamente por seguridad
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Compartir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstructionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default QRViewerScreen;
