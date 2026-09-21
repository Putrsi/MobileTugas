import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, RefreshControl } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";

type Ranked = {
  username: string;
  points: number;
};

type Period = "today" | "week";

const AVATAR_COLORS = ["#930500", "#5C8FCB", "#C99A3E", "#8FBE73", "#A569BD", "#48A9A6"];

function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const d = new Date(now);
  d.setDate(now.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Peringkat() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [period, setPeriod] = useState<Period>("today");
  const [ranking, setRanking] = useState<Ranked[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.family_id) return;

    const { data: members } = await supabase.from("users").select("username").eq("family_id", user.family_id);

    const start = getPeriodStart(period);
    const { data: history } = await supabase
      .from("task_history")
      .select("username, points, completed_at")
      .eq("family_id", user.family_id)
      .gte("completed_at", start.toISOString());

    if (members) {
      const scores: Record<string, number> = {};
      members.forEach((m) => {
        scores[m.username] = 0;
      });
      (history ?? []).forEach((h) => {
        if (scores[h.username] !== undefined) {
          scores[h.username] += h.points ?? 0;
        }
      });

      const sorted = Object.entries(scores)
        .map(([username, points]) => ({ username, points }))
        .sort((a, b) => b.points - a.points);

      setRanking(sorted);
    }
  }, [user?.family_id, period]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const periodLabel = { today: "Hari ini", week: "Minggu ini" };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.BG} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Papan Peringkat</Text>
        <Text style={styles.headerSub}>{periodLabel[period]}</Text>
      </View>

      <View style={styles.periodRow}>
        {(["today", "week"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>
              {periodLabel[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.CORNFLOWER} />}
      >
        {loading && <Text style={styles.emptyText}>Memuat...</Text>}
        {!loading && ranking.length === 0 && <Text style={styles.emptyText}>Belum ada anggota keluarga.</Text>}

        {ranking.map((r, i) => {
          const isTop = i === 0 && r.points > 0;
          const isMe = r.username.toLowerCase() === user?.username.toLowerCase();
          return (
            <View key={r.username} style={[styles.rankCard, isTop && styles.rankCardTop]}>
              <Text style={styles.rankNo}>{i + 1}</Text>
              <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                <Text style={styles.avatarText}>{r.username.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName}>{isMe ? `${r.username} (Kamu)` : r.username}</Text>
              </View>
              <Text style={styles.rankScore}>{r.points}</Text>
            </View>
          );
        })}
      </ScrollView>
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
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.INK },
    headerSub: { fontSize: 12, color: colors.INK_SOFT, marginTop: 4 },
    periodRow: {
      flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingVertical: 14,
      backgroundColor: colors.SURFACE, borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
    },
    periodTab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.BG, borderWidth: 1, borderColor: colors.LINE, alignItems: "center" },
    periodTabActive: { backgroundColor: colors.SANGRIA, borderColor: colors.SANGRIA },
    periodTabText: { fontSize: 11.5, color: colors.INK_SOFT, fontWeight: "600" },
    periodTabTextActive: { color: "#fff" },
    screen: { flex: 1 },
    emptyText: { color: colors.INK_SOFT, fontSize: 13, textAlign: "center", marginTop: 20 },
    rankCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.SURFACE, borderWidth: 1, borderColor: colors.LINE, borderRadius: 14,
      padding: 12, marginBottom: 10,
    },
    rankCardTop: { backgroundColor: "#2A3C50", borderColor: colors.CORNFLOWER },
    rankNo: { fontWeight: "700", fontSize: 15, color: colors.SANGRIA, width: 20 },
    avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    rankName: { fontSize: 14, fontWeight: "600", color: colors.INK },
    rankScore: { fontWeight: "700", fontSize: 15, color: colors.SANGRIA },
  });
}