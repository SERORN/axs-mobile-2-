import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface Guest {
  id: string;
  name: string;
  phone?: string;
  validUntil: string;
  status: 'active' | 'expired' | 'used';
  vehiclePlate?: string;
}

interface ResidentialScreenProps {
  navigation: any;
  route: {
    params?: {
      residentialId: string;
      residentialName: string;
    };
  };
}

const ResidentialScreen: React.FC<ResidentialScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'invite' | 'history'>('invite');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [validHours, setValidHours] = useState('24');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);

  const { residentialId = 'default', residentialName = 'Mi Residencial' } = route.params || {};

  useEffect(() => {
    loadGuestHistory();
  }, []);

  const loadGuestHistory = async () => {
    // Mock data - en producción vendría del API
    setGuests([
      {
        id: '1',
        name: 'Juan Pérez',
        phone: '+52 555 123 4567',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        vehiclePlate: 'ABC-123',
      },
      {
        id: '2',
        name: 'María García',
        validUntil: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'expired',
      },
    ]);
  };

  const handleInviteGuest = async () => {
    if (!guestName.trim()) {
      Alert.alert('Error', 'El nombre del visitante es requerido');
      return;
    }

    setLoading(true);
    try {
      // Simular creación de pase de visitante
      const newGuest: Guest = {
        id: Date.now().toString(),
        name: guestName.trim(),
        phone: guestPhone.trim() || undefined,
        vehiclePlate: vehiclePlate.trim() || undefined,
        validUntil: new Date(Date.now() + parseInt(validHours) * 60 * 60 * 1000).toISOString(),
        status: 'active',
      };

      // Generar QR para el visitante
      const passData = {
        id: `VISITOR-${newGuest.id}`,
        type: 'visitor' as const,
        plazaId: residentialId,
        plazaName: residentialName,
        guestName: newGuest.name,
        validUntil: newGuest.validUntil,
        vehicleId: newGuest.vehiclePlate,
      };

      // Limpiar formulario
      setGuestName('');
      setGuestPhone('');
      setVehiclePlate('');
      setValidHours('24');

      // Actualizar lista
      setGuests(prev => [newGuest, ...prev]);

      // Navegar a visualizar QR
      navigation.navigate('QRViewer', { passData });

    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la invitación');
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner', {
      type: 'entry',
      plazaId: residentialId,
    });
  };

  const getStatusColor = (status: Guest['status']) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'expired': return '#FF3B30';
      case 'used': return '#666';
      default: return '#666';
    }
  };

  const getStatusText = (status: Guest['status']) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'expired': return 'Expirado';
      case 'used': return 'Usado';
      default: return status;
    }
  };

  const renderGuest = ({ item }: { item: Guest }) => (
    <View style={styles.guestCard}>
      <View style={styles.guestHeader}>
        <Text style={styles.guestName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      {item.phone && (
        <Text style={styles.guestDetail}>📞 {item.phone}</Text>
      )}
      
      {item.vehiclePlate && (
        <Text style={styles.guestDetail}>🚗 {item.vehiclePlate}</Text>
      )}
      
      <Text style={styles.guestDetail}>
        ⏰ Válido hasta: {new Date(item.validUntil).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>

      {item.status === 'active' && (
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            const passData = {
              id: `VISITOR-${item.id}`,
              type: 'visitor' as const,
              plazaId: residentialId,
              plazaName: residentialName,
              guestName: item.name,
              validUntil: item.validUntil,
              vehicleId: item.vehiclePlate,
            };
            navigation.navigate('QRViewer', { passData });
          }}
        >
          <Text style={styles.shareButtonText}>Ver QR</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Control de Acceso</Text>
        <Text style={styles.subtitle}>{residentialName}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invite' && styles.activeTab]}
          onPress={() => setActiveTab('invite')}
        >
          <Text style={[styles.tabText, activeTab === 'invite' && styles.activeTabText]}>
            Invitar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'invite' ? (
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Crear Invitación de Visitante</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del visitante *</Text>
              <TextInput
                style={styles.input}
                value={guestName}
                onChangeText={setGuestName}
                placeholder="Nombre completo"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Teléfono (opcional)</Text>
              <TextInput
                style={styles.input}
                value={guestPhone}
                onChangeText={setGuestPhone}
                placeholder="+52 555 123 4567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Placa del vehículo (opcional)</Text>
              <TextInput
                style={styles.input}
                value={vehiclePlate}
                onChangeText={setVehiclePlate}
                placeholder="ABC-123"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Vigencia (horas)</Text>
              <View style={styles.hoursContainer}>
                {['12', '24', '48', '72'].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.hourOption,
                      validHours === hours && styles.selectedHourOption
                    ]}
                    onPress={() => setValidHours(hours)}
                  >
                    <Text style={[
                      styles.hourOptionText,
                      validHours === hours && styles.selectedHourOptionText
                    ]}>
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.inviteButton, loading && styles.disabledButton]}
              onPress={handleInviteGuest}
              disabled={loading}
            >
              <Text style={styles.inviteButtonText}>
                {loading ? 'Creando...' : '📋 Crear Invitación'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
              <Text style={styles.scanButtonText}>📱 Escanear QR de Visitante</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={guests}
            renderItem={renderGuest}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay visitantes registrados</Text>
              </View>
            }
          />
        </View>
      )}
    </View>
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  hoursContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  hourOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  selectedHourOption: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  hourOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedHourOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  inviteButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scanButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  guestCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  guestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  guestDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  shareButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ResidentialScreen;
