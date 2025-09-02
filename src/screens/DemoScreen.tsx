import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface DemoCase {
  id: string;
  title: string;
  description: string;
  icon: string;
  qrContent: string;
  scenario: string;
}

interface DemoScreenProps {
  navigation: any;
}

const DemoScreen: React.FC<DemoScreenProps> = ({ navigation }) => {
  const [selectedDemo, setSelectedDemo] = useState<DemoCase | null>(null);

  const demoCases: DemoCase[] = [
    {
      id: 'agencia-vehicular',
      title: 'Agencia Automotriz - Entrada Vehicular',
      description: 'Cliente lleva vehículo para servicio, garantía o siniestro',
      icon: '🚗',
      qrContent: 'axs://ap/agencia-lomas-vehicular-1',
      scenario: 'Flujo completo: VIN, placas, kilometraje, motivo, foto del vehículo'
    },
    {
      id: 'agencia-peatonal',
      title: 'Agencia Automotriz - Entrada Peatonal',
      description: 'Cliente ingresa a pie para consultas o gestiones',
      icon: '🚶',
      qrContent: 'axs://ap/agencia-lomas-peatonal-1',
      scenario: 'Flujo simplificado: información básica y foto'
    },
    {
      id: 'hotel-parking',
      title: 'Hotel - Estacionamiento',
      description: 'Huésped o visitante accede al estacionamiento',
      icon: '🏨',
      qrContent: 'axs://ap/hotel-presidente-parking-1',
      scenario: 'Flujo con pago condicional: placas, habitación, tipo de estancia'
    }
  ];

  const handleDemoQR = (demo: DemoCase) => {
    setSelectedDemo(demo);
  };

  const handleScanDemo = (demo: DemoCase) => {
    setSelectedDemo(null);
    // Simulate QR scan by navigating directly to the flow
    navigation.navigate('QRScanner');
  };

  const renderQRModal = () => {
    if (!selectedDemo) return null;

    return (
      <Modal
        visible={!!selectedDemo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDemo(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Demo QR Code</Text>
            <TouchableOpacity onPress={() => setSelectedDemo(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.demoInfo}>
              <Text style={styles.demoTitle}>
                {selectedDemo.icon} {selectedDemo.title}
              </Text>
              <Text style={styles.demoDescription}>{selectedDemo.description}</Text>
              <Text style={styles.demoScenario}>{selectedDemo.scenario}</Text>
            </View>

            <View style={styles.qrContainer}>
              <QRCode
                value={selectedDemo.qrContent}
                size={200}
                backgroundColor="white"
                color="black"
              />
              <Text style={styles.qrContent}>{selectedDemo.qrContent}</Text>
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>📱 Cómo probar:</Text>
              <Text style={styles.instructionsText}>
                1. Presiona "Escanear QR" para abrir el escáner{'\n'}
                2. Apunta la cámara al código QR de arriba{'\n'}
                3. Sigue el flujo de check-in que aparece{'\n'}
                4. Completa el formulario y toma la foto requerida
              </Text>
            </View>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => handleScanDemo(selectedDemo)}
            >
              <Text style={styles.scanButtonText}>📷 Escanear QR</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 AXS Demo</Text>
        <Text style={styles.subtitle}>Casos de uso del sistema</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Sistema AXS</Text>
          <Text style={styles.infoText}>
            AXS es una plataforma de control de accesos con QR estáticos por punto de entrada.
            Cada QR activa un flujo configurable para check-in/check-out con timestamp y foto.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Casos de Uso Disponibles</Text>

        {demoCases.map((demo) => (
          <TouchableOpacity
            key={demo.id}
            style={styles.demoCard}
            onPress={() => handleDemoQR(demo)}
          >
            <View style={styles.demoHeader}>
              <Text style={styles.demoIcon}>{demo.icon}</Text>
              <View style={styles.demoHeaderText}>
                <Text style={styles.demoCardTitle}>{demo.title}</Text>
                <Text style={styles.demoCardDescription}>{demo.description}</Text>
              </View>
            </View>
            <Text style={styles.demoScenarioText}>{demo.scenario}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Herramientas de Demo</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <Text style={styles.actionButtonText}>📷 Abrir Escáner QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('OperatorQueue')}
          >
            <Text style={styles.actionButtonText}>👨‍💼 Cola de Operador</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {
              Alert.alert(
                'Información de Demo',
                'Usuario: +525512345678\nOTP: cualquier código\n\nTodos los flows están configurados como prueba.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>ℹ️ Info de Acceso</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.technicalSection}>
          <Text style={styles.sectionTitle}>🔧 Información Técnica</Text>
          <View style={styles.techCard}>
            <Text style={styles.techTitle}>Formato QR:</Text>
            <Text style={styles.techText}>axs://ap/&lt;accessPointPublicId&gt;</Text>
            
            <Text style={styles.techTitle}>API Endpoints:</Text>
            <Text style={styles.techText}>
              • GET /access-points/:publicId{'\n'}
              • GET /flows/by-access-point/:publicId{'\n'}
              • POST /visits/checkin{'\n'}
              • GET /queue
            </Text>
            
            <Text style={styles.techTitle}>Base de Datos:</Text>
            <Text style={styles.techText}>
              Multitenancy: tenants → sites → access_points{'\n'}
              Flujos: flows (JSON configurable){'\n'}
              Visitas: visits (check-in/out con fotos)
            </Text>
          </View>
        </View>
      </ScrollView>

      {renderQRModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  demoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  demoHeaderText: {
    flex: 1,
  },
  demoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  demoCardDescription: {
    fontSize: 14,
    color: '#666',
  },
  demoScenarioText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  actionsSection: {
    marginTop: 24,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  technicalSection: {
    marginTop: 24,
  },
  techCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  techTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  techText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'monospace',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  demoInfo: {
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  demoDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  demoScenario: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrContent: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DemoScreen;