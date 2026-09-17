import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, StatusBar } from "react-native";
import { BG, SURFACE, SANGRIA, CORNFLOWER, INK, INK_SOFT, LINE } from "./theme";

const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const schedule = [
  { task: "Cuci piring", marks: ["mint", "coral", "mint", "coral", "mint", "navy", "gold"] },
  { task: "Sampah", marks: ["navy", "", "navy", "", "navy", "", ""] },
  { task: "Menyapu", marks: ["", "gold", "", "gold", "", "coral", ""] },
  { task: "Belanja", marks: ["", "", "", "", "", "coral", ""] },
];

const colorMap = {
  mint: "#6FA97F",
  coral: "#C23B32",
  navy: CORNFLOWER,
  gold: "#C99A3E",
};

export default function Jadwal() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jadwal Mingguan</Text>
        <Text style={styles.headerSub}>Warna menunjukkan anggota keluarga</Text>
      </View>

      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* header row */}
            <View style={styles.row}>
              <Text style={[styles.cell, styles.taskLabel]}></Text>
              {days.map((d) => (
                <Text key={d} style={[styles.cell, styles.dayLabel]}>{d}</Text>
              ))}
            </View>

            {/* data rows */}
            {schedule.map((s) => (
              <View key={s.task} style={styles.row}>
                <Text style={[styles.cell, styles.taskLabel]}>{s.task}</Text>
                {s.marks.map((m, i) => (
                  <View key={i} style={styles.cell}>
                    {m ? <View style={[styles.mark, { backgroundColor: colorMap[m] }]} /> : <Text style={styles.dash}>—</Text>}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
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
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE },
  cell: { width: 56, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  taskLabel: { width: 100, alignItems: "flex-start", fontSize: 12.5, color: INK, fontWeight: "500" },
  dayLabel: { fontSize: 12, fontWeight: "700", color: SANGRIA },
  mark: { width: 10, height: 10, borderRadius: 5 },
  dash: { color: INK_SOFT, fontSize: 12 },
});