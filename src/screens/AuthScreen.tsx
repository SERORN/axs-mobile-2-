import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const AuthScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const { setToken } = useAuth();

  const requestCode = async () => {
    await axios.post(process.env.API_BASE_URL + "/auth/request-otp", { phone });
    setStep("code");
  };

  const verify = async () => {
    const { data } = await axios.post(process.env.API_BASE_URL + "/auth/verify-otp", {
      phone,
      code,
    });
    setToken(data.access_token);
    navigation.replace("Industry");
  };

  return (
    <View style={styles.container}>
      {step === "phone" ? (
        <>
          <Text style={styles.title}>Bienvenido a AXS</Text>
          <TextInput
            style={styles.input}
            placeholder="+52..."
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Button title="Enviar código" disabled={!phone} onPress={requestCode} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Ingresa el código</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          <Button title="Verificar" disabled={code.length !== 6} onPress={verify} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, marginBottom: 12, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});

export default AuthScreen;
