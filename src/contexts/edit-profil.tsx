
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function EditProfil() {
  const { user, updatePassword } = useAuth();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Lengkapi dulu", "Isi password baru dua-duanya.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Gak cocok", "Password baru dan konfirmasi harus sama.");
      return;
    }
    if (newPassword.length < 4) {
      Alert.alert("Terlalu pendek", "Password minimal 4 karakter.");
      return;
    }

    setBusy(true);
    try {
      await updatePassword(newPassword);
      Alert.alert("Berhasil", "Password sudah diganti.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Gagal", "Coba lagi ya.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.BG} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{user?.username}</Text>
            </View>
            <Text style={styles.hint}>Username gak bisa diubah</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password baru</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimal 4 karakter"
              placeholderTextColor={colors.INK_SOFT}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Konfirmasi password baru</Text>
            <TextInput
              style={styles.input}
              placeholder="Ulangi password baru"
              placeholderTextColor={colors.INK_SOFT}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={busy}>
            <Text style={styles.saveBtnText}>{busy ? "Menyimpan..." : "Simpan perubahan"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.BG },
    header: {
      backgroundColor: colors.SURFACE, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16,
      borderBottomLeftRadius: 26, borderBottomRightRadius: 26, borderBottomWidth: 1, borderBottomColor: colors.LINE,
    },
    backBtn: { color: colors.CORNFLOWER, fontSize: 13, fontWeight: "600", marginBottom: 8 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.INK },
    content: { padding: 20 },
    field: { marginBottom: 18 },
    label: { fontSize: 12.5, color: colors.INK_SOFT, marginBottom: 6, fontWeight: "600" },
    input: {
      backgroundColor: colors.SURFACE, borderWidth: 1, borderColor: colors.LINE, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.INK,
    },
    readonlyBox: {
      backgroundColor: colors.LINE, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    },
    readonlyText: { fontSize: 14, color: colors.INK_SOFT, fontWeight: "600" },
    hint: { fontSize: 11, color: colors.INK_SOFT, marginTop: 6 },
    saveBtn: { backgroundColor: colors.SANGRIA, borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
    saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  });
}