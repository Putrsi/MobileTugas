import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeId, themes } from "../../lib/_theme";

const menuItems = ["Edit profil", "Kelola anggota keluarga", "Notifikasi"];

export default function Profil() {
  const { user, unlockTheme, logout } = useAuth();
  const { activeThemeId, setActiveThemeId, isUnlocked, colors } = useTheme();
  const styles = makeStyles(colors);

  const handleMenuPress = (item: string) => {
    if (item === "Kelola anggota keluarga")
      router.push("/kelola-keluarga" as any);
    if (item === "Edit profil") router.push("/edit-profil" as any);
  };

  const handleBuy = (id: ThemeId) => {
    Alert.alert(
      `Beli ${themes[id].label}`,
      `Simulasi pembayaran ${themes[id].price}. Ini belum nyambung ke payment beneran, cuma buat coba alurnya dulu.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Bayar (simulasi)",
          onPress: async () => {
            await unlockTheme(id);
            Alert.alert("Berhasil", `${themes[id].label} sudah terbuka!`);
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Keluar", "Yakin mau keluar dari akun ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.BG} />
      <View style={styles.header}>
        <View style={styles.bigAvatar}>
          <Text style={styles.bigAvatarText}>
            {user?.username?.slice(0, 2).toUpperCase() ?? "??"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.username ?? "Tamu"}</Text>
        <Text style={styles.role}>Keluarga</Text>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.menuRow}
            onPress={() => handleMenuPress(item)}
          >
            <Text style={styles.menuText}>{item}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Toko Tema</Text>

        {(Object.keys(themes) as ThemeId[]).map((id) => {
          const t = themes[id];
          const unlocked = isUnlocked(id);
          const active = activeThemeId === id;

          return (
            <View key={id} style={styles.themeCard}>
              <View style={styles.themeSwatchRow}>
                <View style={[styles.swatch, { backgroundColor: t.SANGRIA }]} />
                <View
                  style={[styles.swatch, { backgroundColor: t.CORNFLOWER }]}
                />
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: t.BG,
                      borderWidth: 1,
                      borderColor: t.LINE,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.themeName}>{t.label}</Text>
                <Text style={styles.themeStatus}>
                  {unlocked
                    ? active
                      ? "Sedang dipakai"
                      : "Sudah dimiliki"
                    : `Terkunci · ${t.price}`}
                </Text>
              </View>

              {unlocked ? (
                <TouchableOpacity
                  style={[styles.themeBtn, active && styles.themeBtnActive]}
                  onPress={() => setActiveThemeId(id)}
                  disabled={active}
                >
                  <Text style={styles.themeBtnText}>
                    {active ? "Aktif" : "Pakai"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.buyBtn}
                  onPress={() => handleBuy(id)}
                >
                  <Text style={styles.buyBtnText}>Beli</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.BG },
    header: {
      backgroundColor: colors.SURFACE,
      paddingTop: 28,
      paddingBottom: 24,
      alignItems: "center",
      borderBottomLeftRadius: 26,
      borderBottomRightRadius: 26,
      borderBottomWidth: 1,
      borderBottomColor: colors.LINE,
    },
    bigAvatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.SANGRIA,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    bigAvatarText: { color: "#fff", fontWeight: "700", fontSize: 22 },
    name: { fontSize: 17, fontWeight: "700", color: colors.INK },
    role: { fontSize: 12, color: colors.INK_SOFT, marginTop: 2 },
    screen: { flex: 1 },
    menuRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.SURFACE,
      borderWidth: 1,
      borderColor: colors.LINE,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    menuText: { fontSize: 13.5, color: colors.INK, fontWeight: "500" },
    chevron: { fontSize: 16, color: colors.INK_SOFT },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.INK,
      marginTop: 12,
      marginBottom: 12,
    },
    themeCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.SURFACE,
      borderWidth: 1,
      borderColor: colors.LINE,
      borderRadius: 14,
      padding: 12,
      marginBottom: 10,
    },
    themeSwatchRow: { flexDirection: "row" },
    swatch: { width: 16, height: 32, marginRight: -6, borderRadius: 4 },
    themeName: { fontSize: 13.5, fontWeight: "600", color: colors.INK },
    themeStatus: { fontSize: 11, color: colors.INK_SOFT, marginTop: 2 },
    themeBtn: {
      backgroundColor: colors.LINE,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    themeBtnActive: { backgroundColor: colors.SANGRIA },
    themeBtnText: { fontSize: 11.5, fontWeight: "700", color: colors.INK },
    buyBtn: {
      backgroundColor: colors.SANGRIA,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    buyBtnText: { fontSize: 11.5, fontWeight: "700", color: "#fff" },
    logoutBtn: { marginTop: 14, alignItems: "center", paddingVertical: 14 },
    logoutText: { fontSize: 13.5, color: colors.SANGRIA, fontWeight: "700" },
  });
}
