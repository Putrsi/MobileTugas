import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { BG, INK, INK_SOFT, LINE, SANGRIA, SURFACE } from "./theme";

const menuItems = [
  "Edit profil",
  "Kelola anggota keluarga",
  "Notifikasi",
  "Tema aplikasi",
  "Tentang RumahTugas",
];

export default function Profil() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.header}>
        <View style={styles.bigAvatar}>
          <Text style={styles.bigAvatarText}>AY</Text>
        </View>
        <Text style={styles.name}>Ayah</Text>
        <Text style={styles.role}>Keluarga Wijaya · Admin</Text>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item} style={styles.menuRow}>
            <Text style={styles.menuText}>{item}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: SURFACE,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  bigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SANGRIA,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  bigAvatarText: { color: "#fff", fontWeight: "700", fontSize: 22 },
  name: { fontSize: 17, fontWeight: "700", color: INK },
  role: { fontSize: 12, color: INK_SOFT, marginTop: 2 },
  screen: { flex: 1 },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  menuText: { fontSize: 13.5, color: INK, fontWeight: "500" },
  chevron: { fontSize: 16, color: INK_SOFT },
  logoutBtn: { marginTop: 10, alignItems: "center", paddingVertical: 14 },
  logoutText: { fontSize: 13.5, color: SANGRIA, fontWeight: "700" },
});
