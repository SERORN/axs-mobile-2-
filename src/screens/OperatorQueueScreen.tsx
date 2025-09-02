import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';

interface Visit {
  id: string;
  status: string;
  checkinAt: string;
  user?: { name: string; phone: string };
  vehicle?: { plate: string; brand: string; model: string };
  accessPoint: { name: string };
  site: { name: string };
  visitForms?: Array<{ answersJson: any }>;
}

interface OperatorQueueScreenProps {
  navigation: any;
  route: {
    params?: {
      siteId?: string;
    };
  };
}

const OperatorQueueScreen: React.FC<OperatorQueueScreenProps> = ({ navigation, route }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { siteId } = route.params || {};

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (siteId) params.append('site', siteId);
      params.append('state', 'PENDING,CHECKED_IN');

      // TODO: Get auth token from context
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/queue?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVisits(data);
      } else {
        Alert.alert('Error', 'No se pudo cargar la cola');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVisitAction = async (visitId: string, action: 'approve' | 'deny') => {
    setActionLoading(true);
    try {
      const endpoint = action === 'approve' ? 'approve' : 'deny';
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/visits/${visitId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(action === 'deny' ? { reason: 'Rechazado por operador' } : {}),
      });

      if (response.ok) {
        Alert.alert(
          'Éxito',
          `Visita ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`,
          [{ text: 'OK', onPress: () => {
            setSelectedVisit(null);
            loadQueue();
          }}]
        );
      } else {
        Alert.alert('Error', `No se pudo ${action === 'approve' ? 'aprobar' : 'rechazar'} la visita`);
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FF9500';
      case 'CHECKED_IN': return '#34C759';
      case 'CHECKED_OUT': return '#8E8E93';
      case 'DENIED': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CHECKED_IN': return 'Dentro';
      case 'CHECKED_OUT': return 'Salida';
      case 'DENIED': return 'Rechazado';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '--:--';
    }
  };

  const renderVisit = ({ item }: { item: Visit }) => (
    <TouchableOpacity
      style={styles.visitCard}
      onPress={() => setSelectedVisit(item)}
    >
      <View style={styles.visitHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={styles.timeText}>
          {item.checkinAt ? formatTime(item.checkinAt) : 'Sin hora'}
        </Text>
      </View>

      <View style={styles.visitInfo}>
        <Text style={styles.accessPointText}>{item.accessPoint.name}</Text>
        {item.user && (
          <Text style={styles.userText}>{item.user.name || 'Sin nombre'}</Text>
        )}
        {item.vehicle && (
          <Text style={styles.vehicleText}>
            {item.vehicle.plate} - {item.vehicle.brand} {item.vehicle.model}
          </Text>
        )}
      </View>

      <View style={styles.visitActions}>
        {item.status === 'PENDING' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleVisitAction(item.id, 'approve')}
            >
              <Text style={styles.actionButtonText}>✓ Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.denyButton]}
              onPress={() => handleVisitAction(item.id, 'deny')}
            >
              <Text style={styles.actionButtonText}>✗ Rechazar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderVisitDetails = () => {
    if (!selectedVisit) return null;

    const answers = selectedVisit.visitForms?.[0]?.answersJson || {};

    return (
      <Modal
        visible={!!selectedVisit}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedVisit(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles de Visita</Text>
            <TouchableOpacity onPress={() => setSelectedVisit(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.detailLabel}>Estado:</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(selectedVisit.status) }]}>
              {getStatusText(selectedVisit.status)}
            </Text>

            <Text style={styles.detailLabel}>Punto de Acceso:</Text>
            <Text style={styles.detailValue}>{selectedVisit.accessPoint.name}</Text>

            <Text style={styles.detailLabel}>Sede:</Text>
            <Text style={styles.detailValue}>{selectedVisit.site.name}</Text>

            {selectedVisit.user && (
              <>
                <Text style={styles.detailLabel}>Usuario:</Text>
                <Text style={styles.detailValue}>{selectedVisit.user.name}</Text>
                <Text style={styles.detailValue}>{selectedVisit.user.phone}</Text>
              </>
            )}

            {selectedVisit.vehicle && (
              <>
                <Text style={styles.detailLabel}>Vehículo:</Text>
                <Text style={styles.detailValue}>
                  {selectedVisit.vehicle.plate} - {selectedVisit.vehicle.brand} {selectedVisit.vehicle.model}
                </Text>
              </>
            )}

            {Object.keys(answers).length > 0 && (
              <>
                <Text style={styles.detailLabel}>Información del Formulario:</Text>
                {Object.entries(answers).map(([key, value]) => (
                  <Text key={key} style={styles.detailValue}>
                    {key}: {String(value)}
                  </Text>
                ))}
              </>
            )}

            {selectedVisit.status === 'PENDING' && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.approveButton]}
                  onPress={() => handleVisitAction(selectedVisit.id, 'approve')}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.actionButtonText}>✓ Aprobar</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.denyButton]}
                  onPress={() => handleVisitAction(selectedVisit.id, 'deny')}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.actionButtonText}>✗ Rechazar</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando cola...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cola de Visitas</Text>
        <Text style={styles.subtitle}>{visits.length} visitas activas</Text>
      </View>

      <FlatList
        data={visits}
        renderItem={renderVisit}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadQueue(true)}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay visitas pendientes</Text>
            <Text style={styles.emptySubtext}>Las nuevas visitas aparecerán aquí</Text>
          </View>
        )}
      />

      {renderVisitDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  visitCard: {
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
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  visitInfo: {
    marginBottom: 12,
  },
  accessPointText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  vehicleText: {
    fontSize: 14,
    color: '#888',
  },
  visitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  denyButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
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
    padding: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default OperatorQueueScreen;