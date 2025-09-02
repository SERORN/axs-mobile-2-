import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from "react-native";

interface Industry {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  screen: string;
  params?: any;
}

const industries: Industry[] = [
  {
    id: 'parking',
    name: 'Estacionamiento',
    description: 'Controla entrada, salida y pagos de estacionamiento',
    icon: '🚗',
    color: '#007AFF',
    screen: 'Parking',
  },
  {
    id: 'residential',
    name: 'Residencial',
    description: 'Gestiona accesos de visitantes y residentes',
    icon: '🏠',
    color: '#34C759',
    screen: 'Residential',
    params: {
      residentialId: 'demo-residential',
      residentialName: 'Residencial Las Flores',
    },
  },
  {
    id: 'corporate',
    name: 'Corporativo',
    description: 'Control de acceso empresarial y oficinas',
    icon: '🏢',
    color: '#FF9500',
    screen: 'Residential', // Reutilizamos la misma pantalla
    params: {
      residentialId: 'demo-corporate',
      residentialName: 'Torre Corporativa Santa Fe',
    },
  },
  {
    id: 'lounges',
    name: 'Lounges VIP',
    description: 'Compra pases para lounges de aeropuerto',
    icon: '✈️',
    color: '#AF52DE',
    screen: 'Lounge',
    params: {
      loungeId: 'vip-lounge',
      loungeName: 'VIP Lounge Terminal 2',
    },
  },
  {
    id: 'tollbooths',
    name: 'Peajes',
    description: 'Pago rápido en casetas de peaje',
    icon: '🛣️',
    color: '#FF3B30',
    screen: 'Parking', // Por ahora redirige a parking
    params: {
      isFreeway: true,
    },
  },
];

const IndustrySelectScreen = ({ navigation }: { navigation: any }) => {
  const handleIndustrySelect = (industry: Industry) => {
    navigation.navigate(industry.screen, industry.params);
  };

  const renderIndustryCard = (industry: Industry) => (
    <TouchableOpacity
      key={industry.id}
      style={[styles.industryCard, { borderLeftColor: industry.color }]}
      onPress={() => handleIndustrySelect(industry)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: industry.color }]}>
            <Text style={styles.icon}>{industry.icon}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.industryName}>{industry.name}</Text>
            <Text style={styles.industryDescription}>{industry.description}</Text>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>¿Qué servicio necesitas?</Text>
        <Text style={styles.subtitle}>Selecciona la industria para continuar</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {industries.map(renderIndustryCard)}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ¿No encuentras tu servicio? 
        </Text>
        <TouchableOpacity>
          <Text style={styles.contactLink}> Contáctanos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  industryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  titleContainer: {
    flex: 1,
  },
  industryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  industryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  contactLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default IndustrySelectScreen;
