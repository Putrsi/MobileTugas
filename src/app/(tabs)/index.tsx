import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { BG, SURFACE, SANGRIA, SANGRIA_DEEP, CORNFLOWER, INK, INK_SOFT, LINE } from "./theme";

const family = [
  { id: "ay", name: "Ayah", initials: "AY", color: "#930500" },
  { id: "ib", name: "Ibu", initials: "IB", color: "#5C8FCB" },
  { id: "ka", name: "Kakak", initials: "KA", color: "#C99A3E" },
  { id: "ad", name: "Adik", initials: "AD", color: "#8FBE73" },
];

const initialTasks = [
  { id: 1, name: "Bayar tagihan listrik", sub: "Terlewat 1 hari", points: 10, mine: true, done: false },
  { id: 2, name: "Masak makan malam", sub: "Ibu · 17.30", points: 6, mine: false, done: false },
  { id: 3, name: "Rapikan mainan", sub: "Adik · Selesai tadi pagi", points: 3, mine: false, done: true },
];

export default function Beranda() {
  const [activeMember, setActiveMember] = useState("ay");
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={styles.header}>
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrowText}>Keluarga Wijaya</Text>
        </View>
        <Text style={styles.headerTitle}>Selamat sore, atur rumah lebih mudah.</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statPill, styles.statPillFilled]}>
            <Text style={[styles.statNum, styles.statNumFilled]}>
              {tasks.filter((t) => !t.done).length}
            </Text>
            <Text style={[styles.statCap, styles.statCapFilled]}>Tugas hari ini</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>89</Text>
            <Text style={styles.statCap}>Poin minggu ini</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>#1</Text>
            <Text style={styles.statCap}>Peringkatmu</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anggota keluarga</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.avatarRow}>
              {family.map((m) => (
                <TouchableOpacity key={m.id} style={styles.avatarChip} onPress={() => setActiveMember(m.id)}>
                  <View style={[styles.avatar, { backgroundColor: m.color }, activeMember === m.id && styles.avatarActive]}>
                    <Text style={styles.avatarText}>{m.initials}</Text>
                  </View>
                  <Text style={styles.avatarLabel}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Tugas hari ini</Text>
          </View>

          {tasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.taskCard, t.mine && styles.taskCardMine, t.done && styles.taskCardDone]}
              onPress={() => toggleTask(t.id)}
            >
              <View style={[styles.taskCheck, t.done && styles.taskCheckDone]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskName, t.done && styles.taskNameStrike]}>{t.name}</Text>
                <Text style={styles.taskSub}>{t.sub}</Text>
              </View>
              <View style={styles.taskPointsPill}>
                <Text style={styles.taskPointsText}>{t.points} poin</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.premiumCard}>
          <Text style={styles.premiumEmoji}>🏆</Text>
          <Text style={styles.premiumTitle}>Buka Tema Spesial</Text>
          <Text style={styles.premiumDesc}>
            Aktifkan palet Sangria & stiker eksklusif untuk memotivasi seluruh keluarga.
          </Text>
          <View style={styles.premiumBtn}>
            <Text style={styles.premiumBtnText}>Aktifkan — Rp 19.000</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: SURFACE,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CORNFLOWER },
  eyebrowText: { fontSize: 12, color: INK_SOFT, fontWeight: "500" },
  headerTitle: { fontSize: 22, fontWeight: "600", color: INK, lineHeight: 28, maxWidth: 260 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  statPill: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: LINE, borderRadius: 14, padding: 10 },
  statPillFilled: { backgroundColor: SANGRIA, borderColor: SANGRIA },
  statNum: { fontSize: 18, fontWeight: "700", color: INK },
  statNumFilled: { color: "#FFF" },
  statCap: { fontSize: 10.5, color: INK_SOFT, marginTop: 2 },
  statCapFilled: { color: "#F5D9D6" },
  screen: { flex: 1 },
  section: { paddingHorizontal: 20, paddingTop: 18 },
  sectionTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15.5, fontWeight: "700", color: INK, marginBottom: 12 },
  avatarRow: { flexDirection: "row", gap: 12 },
  avatarChip: { alignItems: "center", gap: 5 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: "transparent" },
  avatarActive: { borderColor: CORNFLOWER },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  avatarLabel: { fontSize: 10.5, color: INK_SOFT, fontWeight: "500" },
  taskCard: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: SURFACE,
    borderWidth: 1, borderColor: LINE, borderLeftWidth: 4, borderLeftColor: CORNFLOWER,
    borderRadius: 14, padding: 12, marginBottom: 10,
  },
  taskCardMine: { borderLeftColor: SANGRIA },
  taskCardDone: { borderLeftColor: "#6FA97F", opacity: 0.55 },
  taskCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: CORNFLOWER },
  taskCheckDone: { backgroundColor: "#6FA97F", borderColor: "#6FA97F" },
  taskName: { fontSize: 13, fontWeight: "600", color: INK },
  taskNameStrike: { textDecorationLine: "line-through", opacity: 0.6 },
  taskSub: { fontSize: 11, color: INK_SOFT, marginTop: 2 },
  taskPointsPill: { backgroundColor: "rgba(194,59,50,0.18)", borderRadius: 20, paddingVertical: 4, paddingHorizontal: 9 },
  taskPointsText: { fontSize: 11, fontWeight: "700", color: SANGRIA },
  premiumCard: { marginHorizontal: 20, marginTop: 18, backgroundColor: SANGRIA_DEEP, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: SANGRIA },
  premiumEmoji: { position: "absolute", right: 16, top: 16, fontSize: 30 },
  premiumTitle: { fontSize: 14.5, fontWeight: "700", color: "#FFF", marginBottom: 4 },
  premiumDesc: { fontSize: 11.5, color: "#E9C7C3", maxWidth: 220, lineHeight: 16 },
  premiumBtn: { marginTop: 12, alignSelf: "flex-start", backgroundColor: "#FFF", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  premiumBtnText: { fontSize: 11.5, fontWeight: "700", color: SANGRIA },
});