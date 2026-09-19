
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, StatusBar } from "react-native";
import { BG, SURFACE, SANGRIA, CORNFLOWER, INK, INK_SOFT, LINE } from "./theme";

const leaderboard = [
  { rank: 1, name: "Ibu", streak: "Runtutan 6 hari", score: 42, color: "#930500", top: true },
  { rank: 2, name: "Ayah", streak: "Runtutan 3 hari", score: 35, color: "#5C8FCB" },
  { rank: 3, name: "Kakak", streak: "Runtutan 4 hari", score: 28, color: "#C99A3E" },
  { rank: 4, name: "Adik", streak: "Runtutan 2 hari", score: 14, color: "#8FBE73" },
];

export default function Peringkat() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Papan Peringkat</Text>
        <Text style={styles.headerSub}>Berdasarkan poin minggu ini</Text>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
        {leaderboard.map((r) => (
          <View key={r.rank} style={[styles.rankCard, r.top && styles.rankCardTop]}>
            <Text style={styles.rankNo}>{r.rank}</Text>
            <View style={[styles.avatar, { backgroundColor: r.color }]}>
              <Text style={styles.avatarText}>{r.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rankName}>{r.name}</Text>
              <Text style={styles.rankStreak}>{r.streak}</Text>
            </View>
            <Text style={styles.rankScore}>{r.score}</Text>
          </View>
        ))}

        <View style={styles.stickerCard}>
          <Text style={styles.stickerTitle}>Stiker & Tema</Text>
          <View style={styles.stickerRow}>
            {["🌟", "🏆", "🦸", "🎨"].map((e, i) => (
              <View key={i} style={[styles.sticker, i > 1 && styles.stickerLocked]}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.stickerNote}>Buka stiker dengan poin atau beli langsung.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: SURFACE, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20,
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26, borderBottomWidth: 1, borderBottomColor: LINE,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: INK },
  headerSub: { fontSize: 12, color: INK_SOFT, marginTop: 4 },
  screen: { flex: 1 },
  rankCard: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: SURFACE,
    borderWidth: 1, borderColor: LINE, borderRadius: 14, padding: 12, marginBottom: 10,
  },
  rankCardTop: { backgroundColor: "#2A3C50", borderColor: CORNFLOWER },
  rankNo: { fontWeight: "700", fontSize: 15, color: SANGRIA, width: 18 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  rankName: { fontSize: 14, fontWeight: "600", color: INK },
  rankStreak: { fontSize: 11, color: INK_SOFT },
  rankScore: { fontWeight: "700", fontSize: 15, color: SANGRIA },
  stickerCard: { marginTop: 10, backgroundColor: SURFACE, borderWidth: 1, borderColor: LINE, borderRadius: 14, padding: 16 },
  stickerTitle: { fontSize: 14, fontWeight: "700", color: INK, marginBottom: 12 },
  stickerRow: { flexDirection: "row", gap: 10 },
  sticker: { width: 50, height: 50, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  stickerLocked: { opacity: 0.4 },
  stickerNote: { fontSize: 11.5, color: INK_SOFT, marginTop: 10 },
});
