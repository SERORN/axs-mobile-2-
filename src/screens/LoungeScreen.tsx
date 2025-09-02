import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';

interface LoungePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // en horas
  features: string[];
  available: boolean;
  maxCapacity: number;
  currentOccupancy: number;
}

interface LoungeScreenProps {
  navigation: any;
  route: {
    params?: {
      loungeId: string;
      loungeName: string;
    };
  };
}

const LoungeScreen: React.FC<LoungeScreenProps> = ({ navigation, route }) => {
  const [plans, setPlans] = useState<LoungePlan[]>([]);
  const [loading, setLoading] = useState(false);

  const { loungeId = 'vip-lounge', loungeName = 'VIP Lounge Aeropuerto' } = route.params || {};

  useEffect(() => {
    loadLoungePlans();
  }, []);

  const loadLoungePlans = async () => {
    // Mock data - en producción vendría del API
    setPlans([
      {
        id: 'express',
        name: 'Pase Express',
        description: 'Acceso rápido de 3 horas con servicios básicos',
        price: 450,
        currency: 'MXN',
        duration: 3,
        features: ['WiFi ilimitado', 'Snacks básicos', 'Bebidas sin alcohol'],
        available: true,
        maxCapacity: 50,
        currentOccupancy: 32,
      },
      {
        id: 'premium',
        name: 'Pase Premium',
        description: 'Experiencia completa de 6 horas con todos los servicios',
        price: 850,
        currency: 'MXN',
        duration: 6,
        features: [
          'WiFi premium',
          'Buffet completo',
          'Bar premium',
          'Duchas privadas',
          'Área de descanso',
          'Servicio de concierge'
        ],
        available: true,
        maxCapacity: 30,
        currentOccupancy: 18,
      },
      {
        id: 'business',
        name: 'Pase Business',
        description: 'Para reuniones de trabajo con sala privada',
        price: 1200,
        currency: 'MXN',
        duration: 4,
        features: [
          'Sala de juntas privada',
          'Equipos de videoconferencia',
          'Servicio de secretaria',
          'Catering premium',
          'WiFi empresarial'
        ],
        available: false, // Sold out
        maxCapacity: 8,
        currentOccupancy: 8,
      },
    ]);
  };

  const handlePurchasePlan = async (plan: LoungePlan) => {
    if (!plan.available) {
      Alert.alert('No disponible', 'Este pase está agotado en este momento');
      return;
    }

    Alert.alert(
      'Confirmar compra',
      `¿Deseas comprar el ${plan.name} por ${formatCurrency(plan.price, plan.currency)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: () => proceedToPurchase(plan),
        },
      ]
    );
  };

  const proceedToPurchase = (plan: LoungePlan) => {
    navigation.navigate('Payment', {
      amount: plan.price,
      plazaId: loungeId,
      plazaName: loungeName,
      currency: plan.currency.toLowerCase(),
      metadata: {
        planId: plan.id,
        planName: plan.name,
        duration: plan.duration,
      },
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const locale = currency === 'MXN' ? 'es-MX' : 'es-AR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getOccupancyLevel = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return { level: 'high', color: '#FF3B30', text: 'Muy lleno' };
    if (percentage >= 70) return { level: 'medium', color: '#FF9500', text: 'Lleno' };
    return { level: 'low', color: '#34C759', text: 'Disponible' };
  };

  const renderPlan = (plan: LoungePlan) => {
    const occupancy = getOccupancyLevel(plan.currentOccupancy, plan.maxCapacity);
    
    return (
      <View key={plan.id} style={[styles.planCard, !plan.available && styles.unavailableCard]}>
        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={[styles.occupancyBadge, { backgroundColor: occupancy.color }]}>
              <Text style={styles.occupancyText}>{occupancy.text}</Text>
            </View>
          </View>
          <Text style={styles.planPrice}>{formatCurrency(plan.price, plan.currency)}</Text>
        </View>

        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.planDetails}>
          <Text style={styles.planDuration}>⏰ {plan.duration} horas</Text>
          <Text style={styles.planCapacity}>
            👥 {plan.currentOccupancy}/{plan.maxCapacity} personas
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Incluye:</Text>
          {plan.features.map((feature, index) => (
            <Text key={index} style={styles.feature}>• {feature}</Text>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.purchaseButton, !plan.available && styles.disabledButton]}
          onPress={() => handlePurchasePlan(plan)}
          disabled={!plan.available}
        >
          <Text style={[styles.purchaseButtonText, !plan.available && styles.disabledButtonText]}>
            {plan.available ? `Comprar ${formatCurrency(plan.price, plan.currency)}` : 'Agotado'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lounge Premium</Text>
        <Text style={styles.subtitle}>{loungeName}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.loungeInfo}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ Información del Lounge</Text>
            <Text style={styles.infoText}>
              • Horario: 24/7 disponible
            </Text>
            <Text style={styles.infoText}>
              • Ubicación: Terminal 2, Nivel 2
            </Text>
            <Text style={styles.infoText}>
              • Servicios: WiFi, Alimentación, Descanso
            </Text>
            <Text style={styles.infoText}>
              • Política: No se permiten menores sin acompañante
            </Text>
          </View>
        </View>

        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Planes Disponibles</Text>
          {plans.map(renderPlan)}
        </View>

        <View style={styles.myPassesContainer}>
          <TouchableOpacity
            style={styles.myPassesButton}
            onPress={() => {
              // Navegar a pantalla de mis pases
              Alert.alert('Próximamente', 'Función de historial de pases en desarrollo');
            }}
          >
            <Text style={styles.myPassesButtonText}>🎫 Ver mis pases activos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  loungeInfo: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: 'white',
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
  plansContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  unavailableCard: {
    opacity: 0.6,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  occupancyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  occupancyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  planDuration: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  planCapacity: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  feature: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 4,
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999',
  },
  myPassesContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  myPassesButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  myPassesButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoungeScreen;
