import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "./src/screens/AuthScreen";
import IndustrySelectScreen from "./src/screens/IndustrySelectScreen";
import ParkingScreen from "./src/screens/ParkingScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import QRScannerScreen from "./src/screens/QRScannerScreen";
import QRViewerScreen from "./src/screens/QRViewerScreen";
import ResidentialScreen from "./src/screens/ResidentialScreen";
import LoungeScreen from "./src/screens/LoungeScreen";
import AccessPointFlowScreen from "./src/screens/AccessPointFlowScreen";
import { AuthProvider } from "./src/contexts/AuthContext";
import { PricingProvider } from "./src/contexts/PricingContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import ENV, { validateConfig } from "./src/config/env";

const Stack = createNativeStackNavigator();

export default function App() {
  // Validar configuración al inicio
  React.useEffect(() => {
    validateConfig();
  }, []);

  return (
    <StripeProvider publishableKey={ENV.STRIPE_PUBLISHABLE_KEY}>
      <AuthProvider>
        <PricingProvider>
          <NavigationContainer>
            <StatusBar style='auto' />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name='Auth' component={AuthScreen} />
              <Stack.Screen 
                name='Industry' 
                component={IndustrySelectScreen}
                options={{ headerShown: true, title: 'Servicios AXS' }}
              />
              <Stack.Screen
                name='Parking'
                component={ParkingScreen}
                options={{ headerShown: true, title: 'Estacionamiento' }}
              />
              <Stack.Screen
                name='Residential'
                component={ResidentialScreen}
                options={{ headerShown: true, title: 'Control de Acceso' }}
              />
              <Stack.Screen
                name='Lounge'
                component={LoungeScreen}
                options={{ headerShown: true, title: 'Lounge VIP' }}
              />
              <Stack.Screen
                name='Payment'
                component={PaymentScreen}
                options={{ 
                  headerShown: true, 
                  title: 'Pago',
                  presentation: 'modal' 
                }}
              />
              <Stack.Screen
                name='QRScanner'
                component={QRScannerScreen}
                options={{ 
                  headerShown: false,
                  presentation: 'fullScreenModal' 
                }}
              />
              <Stack.Screen
                name='QRViewer'
                component={QRViewerScreen}
                options={{ 
                  headerShown: true, 
                  title: 'Mi Pase',
                  presentation: 'modal' 
                }}
              />
              <Stack.Screen
                name='AccessPointFlow'
                component={AccessPointFlowScreen}
                options={{ 
                  headerShown: true, 
                  title: 'Check-in',
                  presentation: 'modal' 
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PricingProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
