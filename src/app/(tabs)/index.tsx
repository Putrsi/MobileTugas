import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import { isDoneThisWeek, todayStr } from "../../lib/week";
import { logHistory, undoHistoryToday } from "../../lib/history";

type Task = {
  id: number;
  task_name: string;
  assigned_to: string;
  lastdone: string | null;
  points: number;
};

type Member = {
  username: string;
};

const AVATAR_COLORS = ["#930500", "#5C8FCB", "#C99A3E", "#8FBE73", "#A569BD", "#48A9A6"];

export default function Beranda() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [weekPoints, setWeekPoints] = useState(0);

  const fetchAll = useCallback(async () => {
    if (!user?.family_id) return;
    const [{ data: taskData }, { data: memberData }] = await Promise.all([
      supabase
        .from("tasks")
        .select("id, task_name, assigned_to, lastdone, points")
        .eq("family_id", user.family_id)
        .order("id", { ascending: false }),
      supabase.from("users").select("username").eq("family_id", user.family_id),
    ]);

    if (taskData) {
      setTasks(taskData as Task[]);
      const myPoints = (taskData as Task[])
        .filter((t) => isDoneThisWeek(t.lastdone) && t.assigned_to.toLowerCase() === user.username.toLowerCase())
        .reduce((sum, t) => sum + (t.points ?? 0), 0);
      setWeekPoints(myPoints);
    }
    if (memberData) setMembers(memberData as Member[]);
  }, [user?.family_id, user?.username]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const toggleTask = async (task: Task) => {
    if (task.assigned_to.toLowerCase() !== user?.username.toLowerCase()) {
      Alert.alert("Gak bisa diubah", `Cuma "${task.assigned_to}" yang bisa ubah ini.`);
      return;
    }
    const doneNow = isDoneThisWeek(task.lastdone);
    const newValue = doneNow ? null : todayStr();

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, lastdone: newValue } : t)));

    const { error } = await supabase.from("tasks").update({ lastdone: newValue }).eq("id", task.id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, lastdone: task.lastdone } : t)));
      Alert.alert("Gagal", "Coba lagi ya.");
      return;
    }

    if (newValue) {
      await logHistory({
        familyId: user!.family_id!,
        taskId: task.id,
        username: task.assigned_to,
        taskName: task.task_name,
        points: task.points,
      });
    } else {
      await undoHistoryToday(task.id);
    }

    fetchAll();
  };
  const tasksLeft = tasks.filter((t) => !isDoneThisWeek(t.lastdone)).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.BG} />

      <View style={styles.header}>
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrowText}>{members.length} Anggota keluarga</Text>
        </View>
        <Text style={styles.headerTitle}>Selamat sore, atur rumah lebih mudah.</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statPill, styles.statPillFilled]}>
            <Text style={[styles.statNum, styles.statNumFilled]}>{tasksLeft}</Text>
            <Text style={[styles.statCap, styles.statCapFilled]}>Tugas hari ini</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>{weekPoints}</Text>
            <Text style={styles.statCap}>Poin hari ini</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>#1</Text>
            <Text style={styles.statCap}>Peringkatmu</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.CORNFLOWER} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anggota keluarga</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.avatarRow}>
              {members.map((m, i) => (
                <View key={m.username} style={styles.avatarChip}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] },
                      m.username === user?.username && styles.avatarActive,
                    ]}
                  >
                    <Text style={styles.avatarText}>{m.username.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.avatarLabel}>{m.username === user?.username ? "Kamu" : m.username}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tugas hari ini</Text>

          {tasks.map((t) => {
            const isMine = t.assigned_to.toLowerCase() === user?.username.toLowerCase();
            const done = isDoneThisWeek(t.lastdone);
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.taskCard, isMine && styles.taskCardMine, done && styles.taskCardDone]}
                onPress={() => toggleTask(t)}
              >
                <View style={[styles.taskCheck, done && styles.taskCheckDone]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskName, done && styles.taskNameStrike]}>{t.task_name}</Text>
                  <Text style={styles.taskSub}>{isMine ? "Tugas kamu" : `Ditugasin ke ${t.assigned_to}`}</Text>
                </View>
                <View style={styles.taskPointsPill}>
                  <Text style={styles.taskPointsText}>{t.points} poin</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.premiumCard}>
          <Text style={styles.premiumEmoji}>🏆</Text>
          <Text style={styles.premiumTitle}>Buka Tema Spesial</Text>
          <Text style={styles.premiumDesc}>
            Aktifkan palet Sangria & stiker eksklusif untuk memotivasi seluruh keluarga.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.BG },
    header: {
      backgroundColor: colors.SURFACE,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 24,
      borderBottomLeftRadius: 26,
      borderBottomRightRadius: 26,
      borderBottomWidth: 1,
      borderBottomColor: colors.LINE,
    },
    eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.CORNFLOWER },
    eyebrowText: { fontSize: 12, color: colors.INK_SOFT, fontWeight: "500" },
    headerTitle: { fontSize: 22, fontWeight: "600", color: colors.INK, lineHeight: 28, maxWidth: 260 },
    statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
    statPill: { flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.LINE, borderRadius: 14, padding: 10 },
    statPillFilled: { backgroundColor: colors.SANGRIA, borderColor: colors.SANGRIA },
    statNum: { fontSize: 18, fontWeight: "700", color: colors.INK },
    statNumFilled: { color: "#FFF" },
    statCap: { fontSize: 10.5, color: colors.INK_SOFT, marginTop: 2 },
    statCapFilled: { color: "#F5D9D6" },
    screen: { flex: 1 },
    section: { paddingHorizontal: 20, paddingTop: 18 },
    sectionTitle: { fontSize: 15.5, fontWeight: "700", color: colors.INK, marginBottom: 12 },
    avatarRow: { flexDirection: "row", gap: 12 },
    avatarChip: { alignItems: "center", gap: 5 },
    avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: "transparent" },
    avatarActive: { borderColor: colors.CORNFLOWER },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    avatarLabel: { fontSize: 10.5, color: colors.INK_SOFT, fontWeight: "500" },
    taskCard: {
      flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.SURFACE,
      borderWidth: 1, borderColor: colors.LINE, borderLeftWidth: 4, borderLeftColor: colors.CORNFLOWER,
      borderRadius: 14, padding: 12, marginBottom: 10,
    },
    taskCardMine: { borderLeftColor: colors.SANGRIA },
    taskCardDone: { opacity: 0.55 },
    taskCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.CORNFLOWER },
    taskCheckDone: { backgroundColor: "#6FA97F", borderColor: "#6FA97F" },
    taskName: { fontSize: 13, fontWeight: "600", color: colors.INK },
    taskNameStrike: { textDecorationLine: "line-through", opacity: 0.6 },
    taskSub: { fontSize: 11, color: colors.INK_SOFT, marginTop: 2 },
    taskPointsPill: { backgroundColor: "rgba(194,59,50,0.18)", borderRadius: 20, paddingVertical: 4, paddingHorizontal: 9 },
    taskPointsText: { fontSize: 11, fontWeight: "700", color: colors.SANGRIA },
    premiumCard: { marginHorizontal: 20, marginTop: 18, backgroundColor: colors.SANGRIA_DEEP, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.SANGRIA },
    premiumEmoji: { position: "absolute", right: 16, top: 16, fontSize: 30 },
    premiumTitle: { fontSize: 14.5, fontWeight: "700", color: "#FFF", marginBottom: 4 },
    premiumDesc: { fontSize: 11.5, color: "#E9C7C3", maxWidth: 220, lineHeight: 16 },
  });
}