import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';

interface PaymentScreenProps {
  route: {
    params: {
      amount: number;
      plazaId: string;
      plazaName: string;
      currency?: string;
      passId?: string;
    };
  };
  navigation: any;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route, navigation }) => {
  const { amount, plazaId, plazaName, currency = 'mxn', passId } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      
      // Crear PaymentIntent en el backend
      const response = await axios.post(`${process.env.API_BASE_URL}/payments/intent`, {
        amount: Math.round(amount * 100), // Convertir a centavos
        currency,
        plazaId,
        passId,
      });

      const { clientSecret, ephemeralKey, customer } = response.data;

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'AXS Parking',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Cliente AXS',
        },
        returnURL: 'axs://payment-success',
      });

      if (error) {
        Alert.alert('Error', 'No se pudo inicializar el pago');
        console.error('PaymentSheet init error:', error);
      } else {
        setReady(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor de pagos');
      console.error('Payment init error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    if (!ready) return;

    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code !== 'Canceled') {
        Alert.alert('Error', `Pago fallido: ${error.message}`);
      }
    } else {
      // Pago exitoso
      Alert.alert(
        'Pago exitoso',
        '¡Tu pago ha sido procesado correctamente!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Parking', { paymentSuccess: true }),
          },
        ]
      );
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'mxn' ? '$' : '$';
    const locale = currency === 'mxn' ? 'es-MX' : 'es-AR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumen de Pago</Text>
        <Text style={styles.subtitle}>Plaza: {plazaName}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total a pagar:</Text>
        <Text style={styles.amount}>{formatCurrency(amount, currency)}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>• Incluye impuestos aplicables</Text>
        <Text style={styles.detailText}>• Pago seguro procesado por Stripe</Text>
        <Text style={styles.detailText}>• Recibirás confirmación por SMS</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Preparando pago...</Text>
        </View>
      )}

      {ready && !loading && (
        <TouchableOpacity style={styles.payButton} onPress={openPaymentSheet}>
          <Text style={styles.payButtonText}>Pagar {formatCurrency(amount, currency)}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  amountContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  details: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  payButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default PaymentScreen;
