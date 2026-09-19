
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { BG, SURFACE, SANGRIA, CORNFLOWER, INK, INK_SOFT, LINE } from "./(tabs)/theme";

export default function Login() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert("Lengkapi dulu", "Username dan password harus diisi.");
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        await signup(username, password);
      } else {
        await login(username, password);
      }
      // Gak perlu router.replace manual di sini —
      // Gatekeeper di app/_layout.tsx otomatis ngelempar ke
      // dashboard atau join-family tergantung status user.
    } catch (err: any) {
      Alert.alert("Gagal", terjemahkanError(err.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.brand}>RumahTugas</Text>
          <Text style={styles.title}>
            {isSignup ? "Buat akun keluarga" : "Masuk ke akunmu"}
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="misal: ayahwijaya"
              placeholderTextColor={INK_SOFT}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={INK_SOFT}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={busy}>
            <Text style={styles.submitText}>
              {busy ? "Memproses..." : isSignup ? "Daftar" : "Masuk"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
            <Text style={styles.switchText}>
              {isSignup ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function terjemahkanError(code: string) {
  switch (code) {
    case "USER_NOT_FOUND":
      return "Username belum terdaftar.";
    case "WRONG_PASSWORD":
      return "Password salah.";
    case "USER_EXISTS":
      return "Username ini sudah dipakai, pilih yang lain.";
    default:
      return "Terjadi kesalahan, coba lagi.";
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  brand: { fontSize: 14, fontWeight: "700", color: CORNFLOWER, marginBottom: 6, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "700", color: INK, marginBottom: 28, textAlign: "center" },
  field: { marginBottom: 16 },
  label: { fontSize: 12.5, color: INK_SOFT, marginBottom: 6, fontWeight: "500" },
  input: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: INK,
  },
  submitBtn: {
    backgroundColor: SANGRIA,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  switchText: { color: CORNFLOWER, fontSize: 12.5, textAlign: "center", marginTop: 18, fontWeight: "600" },
});