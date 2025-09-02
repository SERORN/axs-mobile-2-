import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

interface AccessPointFlowScreenProps {
  route: {
    params: {
      accessPoint: any;
      accessPointPublicId: string;
    };
  };
  navigation: any;
}

const AccessPointFlowScreen: React.FC<AccessPointFlowScreenProps> = ({ route, navigation }) => {
  const { accessPoint, accessPointPublicId } = route.params;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flow, setFlow] = useState(null);
  const [formData, setFormData] = useState({});
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    loadFlow();
  }, []);

  const loadFlow = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/flows/by-access-point/${accessPointPublicId}`);
      if (response.ok) {
        const flowData = await response.json();
        setFlow(flowData);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el flujo');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar fotos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhotos(prev => [...prev, base64Image]);
    }
  };

  const updateFormField = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      // Validate required fields
      if (flow?.definitionJson?.screens) {
        for (const screen of flow.definitionJson.screens) {
          for (const field of screen.fields || []) {
            if (field.required && !formData[field.id]) {
              Alert.alert('Campo requerido', `El campo "${field.label}" es obligatorio`);
              setSubmitting(false);
              return;
            }
          }
        }
      }

      // Submit checkin
      const checkinData = {
        accessPointPublicId,
        answers: formData,
        photos,
        guest: false, // TODO: Implement guest mode
      };

      // TODO: Get auth token from context
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/visits/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(checkinData),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.requiredPayment) {
          // Navigate to payment screen
          navigation.replace('Payment', {
            amount: result.requiredPayment.amount,
            currency: result.requiredPayment.currency,
            visitId: result.visitId,
            paymentSheetClientSecret: result.paymentSheetClientSecret,
          });
        } else {
          // Success without payment
          Alert.alert(
            '¡Éxito!',
            'Check-in realizado exitosamente',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Industry'),
              },
            ]
          );
        }
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'No se pudo realizar el check-in');
      }
    } catch (error) {
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              style={styles.textInput}
              value={formData[field.id] || ''}
              onChangeText={(value) => updateFormField(field.id, value)}
              placeholder={field.placeholder}
            />
          </View>
        );
      
      case 'photo':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Text style={styles.photoButtonText}>📷 Tomar Foto</Text>
            </TouchableOpacity>
            {photos.length > 0 && (
              <Text style={styles.photoCount}>{photos.length} foto(s) tomada(s)</Text>
            )}
          </View>
        );
      
      case 'select':
        // TODO: Implement select field
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={styles.placeholder}>Campo de selección (TODO)</Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando flujo...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{accessPoint.name}</Text>
        <Text style={styles.subtitle}>{accessPoint.site?.name}</Text>
        <Text style={styles.description}>
          {flow?.name || 'Flujo de Acceso'}
        </Text>
      </View>

      <View style={styles.form}>
        {flow?.definitionJson?.screens?.[0]?.fields?.map(renderField)}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Realizar Check-in</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
  description: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  photoCount: {
    marginTop: 8,
    fontSize: 14,
    color: '#28a745',
  },
  placeholder: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#28a745',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AccessPointFlowScreen;