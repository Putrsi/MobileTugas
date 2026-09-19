
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

export default function JoinFamily() {
  const { createFamily, joinFamily } = useAuth();
  const [mode, setMode] = useState<"pilih" | "buat" | "gabung">("pilih");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Lengkapi dulu", "Nama grup keluarga harus diisi.");
      return;
    }
    setBusy(true);
    try {
      const generatedCode = await createFamily(name.trim());
      Alert.alert(
        "Grup dibuat!",
        `Kode grup kamu: ${generatedCode}\n\nBagikan kode ini ke anggota keluarga lain biar mereka bisa gabung.`,
        [{ text: "Lanjut", onPress: () => router.replace("/(tabs)") }]
      );
    } catch {
      Alert.alert("Gagal", "Coba lagi ya.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert("Lengkapi dulu", "Kode grup harus diisi.");
      return;
    }
    setBusy(true);
    try {
      await joinFamily(code.trim());
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert(
        "Gagal",
        err.message === "CODE_NOT_FOUND" ? "Kode grup tidak ditemukan." : "Coba lagi ya."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.brand}>RumahTugas</Text>

          {mode === "pilih" && (
            <>
              <Text style={styles.title}>Kamu belum punya grup keluarga</Text>
              <Text style={styles.subtitle}>
                Bikin grup baru buat keluargamu, atau gabung pakai kode yang dikasih anggota lain.
              </Text>

              <TouchableOpacity style={styles.optionCard} onPress={() => setMode("buat")}>
                <Text style={styles.optionTitle}>Buat grup baru</Text>
                <Text style={styles.optionDesc}>Kamu jadi admin, dapat kode buat diundang ke keluarga</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={() => setMode("gabung")}>
                <Text style={styles.optionTitle}>Gabung grup yang ada</Text>
                <Text style={styles.optionDesc}>Masukkan kode dari anggota keluarga kamu</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === "buat" && (
            <>
              <Text style={styles.title}>Buat grup keluarga</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Nama keluarga</Text>
                <TextInput
                  style={styles.input}
                  placeholder="misal: Keluarga Wijaya"
                  placeholderTextColor={INK_SOFT}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={busy}>
                <Text style={styles.submitText}>{busy ? "Memproses..." : "Buat grup"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode("pilih")}>
                <Text style={styles.switchText}>‹ Kembali</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === "gabung" && (
            <>
              <Text style={styles.title}>Gabung grup keluarga</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Kode grup</Text>
                <TextInput
                  style={styles.input}
                  placeholder="misal: A7K2QX"
                  placeholderTextColor={INK_SOFT}
                  autoCapitalize="characters"
                  value={code}
                  onChangeText={setCode}
                />
              </View>
              <TouchableOpacity style={styles.submitBtn} onPress={handleJoin} disabled={busy}>
                <Text style={styles.submitText}>{busy ? "Memproses..." : "Gabung"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode("pilih")}>
                <Text style={styles.switchText}>‹ Kembali</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  brand: { fontSize: 14, fontWeight: "700", color: CORNFLOWER, marginBottom: 6, textAlign: "center" },
  title: { fontSize: 20, fontWeight: "700", color: INK, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 12.5, color: INK_SOFT, textAlign: "center", marginBottom: 24, lineHeight: 18 },
  optionCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  optionTitle: { fontSize: 14.5, fontWeight: "700", color: INK, marginBottom: 4 },
  optionDesc: { fontSize: 12, color: INK_SOFT, lineHeight: 17 },
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
    marginTop: 4,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  switchText: { color: CORNFLOWER, fontSize: 12.5, textAlign: "center", marginTop: 18, fontWeight: "600" },
});