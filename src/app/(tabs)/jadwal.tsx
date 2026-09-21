import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import { logHistory, undoHistoryToday } from "../../lib/history";
import { isDoneThisWeek, todayStr } from "../../lib/week";

type Task = {
  id: number;
  task_name: string;
  assigned_to: string;
  lastdone: string | null;
  points: number;
  daytask: string | null;
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function getTodayName() {
  const idx = new Date().getDay();
  return idx === 0 ? "Minggu" : DAYS[idx - 1];
}

export default function Jadwal() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getTodayName());

  const [showForm, setShowForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newAssignedTo, setNewAssignedTo] = useState("");
  const [newDay, setNewDay] = useState(getTodayName());

  const fetchTasks = useCallback(async () => {
    if (!user?.family_id) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("id, task_name, assigned_to, lastdone, points, daytask")
      .eq("family_id", user.family_id)
      .order("id", { ascending: false });

    if (!error && data) setTasks(data as Task[]);
  }, [user?.family_id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    })();
  }, [fetchTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const toggleDone = async (task: Task) => {
    if (task.assigned_to.toLowerCase() !== user?.username.toLowerCase()) {
      Alert.alert("Gak bisa diubah", `Cuma "${task.assigned_to}" yang bisa nandain tugas ini.`);
      return;
    }
    const doneNow = isDoneThisWeek(task.lastdone);
    const newValue = doneNow ? null : todayStr();

    const updated = tasks.map((t) => (t.id === task.id ? { ...t, lastdone: newValue } : t));
    setTasks(updated);

    const { error } = await supabase.from("tasks").update({ lastdone: newValue }).eq("id", task.id);
    if (error) {
      setTasks(tasks);
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
  };
  
  const addTask = async () => {
    if (!newTaskName.trim() || !newAssignedTo.trim()) {
      Alert.alert("Lengkapi dulu", "Nama tugas dan yang ditugasin harus diisi.");
      return;
    }
    if (!user?.family_id) return;

    const { error } = await supabase.from("tasks").insert({
      family_id: user.family_id,
      task_name: newTaskName.trim(),
      assigned_to: newAssignedTo.trim(),
      daytask: newDay,
      lastdone: null,
      points: 5,
    });

    if (error) {
      Alert.alert("Gagal nambah tugas", "Coba lagi ya.");
      return;
    }

    setNewTaskName("");
    setNewAssignedTo("");
    setShowForm(false);
    fetchTasks();
  };

  const visibleTasks = tasks.filter((t) => t.daytask === selectedDay);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.BG} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jadwal Tugas</Text>
        <Text style={styles.headerSub}>Pilih hari buat lihat tugasnya</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabsScroll} contentContainerStyle={styles.dayTabs}>
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.dayTab, selectedDay === d && styles.dayTabActive]}
            onPress={() => setSelectedDay(d)}
          >
            <Text style={[styles.dayTabText, selectedDay === d && styles.dayTabTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.CORNFLOWER} />}
      >
        {loading && <Text style={styles.emptyText}>Memuat...</Text>}
        {!loading && visibleTasks.length === 0 && (
          <Text style={styles.emptyText}>Belum ada tugas hari {selectedDay}.</Text>
        )}

        {visibleTasks.map((task) => {
          const isMine = task.assigned_to.toLowerCase() === user?.username.toLowerCase();
          const done = isDoneThisWeek(task.lastdone);
          return (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskCard, done && styles.taskCardDone]}
              onPress={() => toggleDone(task)}
              activeOpacity={isMine ? 0.6 : 1}
            >
              <View style={[styles.checkbox, done && styles.checkboxDone]}>
                {done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskName, done && styles.taskNameStrike]}>{task.task_name}</Text>
                <Text style={styles.taskAssignee}>
                  {isMine ? "Tugas kamu" : `Ditugasin ke ${task.assigned_to}`}
                </Text>
              </View>
              <View style={styles.pointsPill}>
                <Text style={styles.pointsText}>{task.points} poin</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {showForm ? (
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Nama tugas (misal: Cuci piring)"
              placeholderTextColor={colors.INK_SOFT}
              value={newTaskName}
              onChangeText={setNewTaskName}
            />
            <TextInput
              style={styles.input}
              placeholder="Username yang ditugasin"
              placeholderTextColor={colors.INK_SOFT}
              autoCapitalize="none"
              value={newAssignedTo}
              onChangeText={setNewAssignedTo}
            />

            <Text style={styles.formLabel}>Hari</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
                {DAYS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayChip, newDay === d && styles.dayChipActive]}
                    onPress={() => setNewDay(d)}
                  >
                    <Text style={[styles.dayChipText, newDay === d && styles.dayChipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
              <TouchableOpacity style={[styles.formBtn, styles.cancelBtn]} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.formBtn, styles.saveBtn]} onPress={addTask}>
                <Text style={styles.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.addBtnText}>+ Tambah tugas</Text>
          </TouchableOpacity>
        )}
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
    dayTabsScroll: { flexGrow: 0, backgroundColor: colors.SURFACE, paddingBottom: 14, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
    dayTabs: { paddingHorizontal: 20, gap: 8 },
    dayTab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.BG, borderWidth: 1, borderColor: colors.LINE },
    dayTabActive: { backgroundColor: colors.SANGRIA, borderColor: colors.SANGRIA },
    dayTabText: { fontSize: 12.5, color: colors.INK_SOFT, fontWeight: "600" },
    dayTabTextActive: { color: "#fff" },
    screen: { flex: 1 },
    emptyText: { color: colors.INK_SOFT, fontSize: 13, textAlign: "center", marginTop: 20 },
    taskCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.SURFACE, borderWidth: 1, borderColor: colors.LINE, borderRadius: 14,
      padding: 12, marginBottom: 10,
    },
    taskCardDone: { opacity: 0.55 },
    checkbox: {
      width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.CORNFLOWER,
      alignItems: "center", justifyContent: "center",
    },
    checkboxDone: { backgroundColor: "#6FA97F", borderColor: "#6FA97F" },
    checkmark: { color: "#fff", fontSize: 12, fontWeight: "700" },
    taskName: { fontSize: 13.5, fontWeight: "600", color: colors.INK },
    taskNameStrike: { textDecorationLine: "line-through" },
    taskAssignee: { fontSize: 11, color: colors.INK_SOFT, marginTop: 2 },
    pointsPill: { backgroundColor: "rgba(194,59,50,0.18)", borderRadius: 20, paddingVertical: 4, paddingHorizontal: 9 },
    pointsText: { fontSize: 11, fontWeight: "700", color: colors.SANGRIA },
    addBtn: {
      borderWidth: 1.5, borderColor: colors.LINE, borderStyle: "dashed", borderRadius: 14,
      paddingVertical: 14, alignItems: "center", marginTop: 6,
    },
    addBtnText: { color: colors.CORNFLOWER, fontWeight: "700", fontSize: 13 },
    formCard: { backgroundColor: colors.SURFACE, borderWidth: 1, borderColor: colors.LINE, borderRadius: 14, padding: 14, gap: 10 },
    input: {
      backgroundColor: colors.BG, borderWidth: 1, borderColor: colors.LINE, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: colors.INK,
    },
    formLabel: { fontSize: 12, color: colors.INK_SOFT, fontWeight: "600", marginTop: 2 },
    dayChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.BG, borderWidth: 1, borderColor: colors.LINE },
    dayChipActive: { backgroundColor: colors.CORNFLOWER, borderColor: colors.CORNFLOWER },
    dayChipText: { fontSize: 11.5, color: colors.INK_SOFT, fontWeight: "600" },
    dayChipTextActive: { color: "#fff" },
    formBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
    cancelBtn: { backgroundColor: colors.BG, borderWidth: 1, borderColor: colors.LINE },
    cancelBtnText: { color: colors.INK_SOFT, fontWeight: "600", fontSize: 12.5 },
    saveBtn: { backgroundColor: colors.SANGRIA },
    saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 12.5 },
  });
}