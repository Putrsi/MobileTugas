
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";

type Member = { username: string };
type FamilyInfo = { name: string; code: string; created_by: string | null };

const AVATAR_COLORS = ["#930500", "#5C8FCB", "#C99A3E", "#8FBE73", "#A569BD", "#48A9A6"];

export default function KelolaKeluarga() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [family, setFamily] = useState<FamilyInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.family_id) return;
    const [{ data: fam }, { data: mem }] = await Promise.all([
      supabase.from("families").select("name, code, created_by").eq("id", user.family_id).single(),
      supabase.from("users").select("username").eq("family_id", user.family_id),
    ]);
    if (fam) setFamily(fam as FamilyInfo);
    if (mem) setMembers(mem as Member[]);
  }, [user?.family_id]);

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

  const isAdmin = family?.created_by?.toLowerCase() === user?.username.toLowerCase();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.BG} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{family?.name ?? "Keluarga"}</Text>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.CORNFLOWER} />}
      >
        {loading && <Text style={styles.emptyText}>Memuat...</Text>}

        {!loading && isAdmin && family && (
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Kode grup keluarga</Text>
            <Text style={styles.codeValue}>{family.code}</Text>
            <Text style={styles.codeHint}>Bagikan kode ini ke anggota keluarga lain buat gabung</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Anggota ({members.length})</Text>
        {members.map((m, i) => (
          <View key={m.username} style={styles.memberRow}>
            <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
              <Text style={styles.avatarText}>{m.username.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.memberName}>{m.username}</Text>
            {m.username.toLowerCase() === family?.created_by?.toLowerCase() && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        ))}
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
    backBtn: { color: colors.CORNFLOWER, fontSize: 13, fontWeight: "600", marginBottom: 8 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.INK },
    screen: { flex: 1 },
    emptyText: { color: colors.INK_SOFT, fontSize: 13, textAlign: "center", marginTop: 20 },
    codeCard: {
      backgroundColor: colors.SURFACE, borderWidth: 1, borderColor: colors.LINE, borderRadius: 16,
      padding: 22, alignItems: "center", marginBottom: 24,
    },
    codeLabel: { fontSize: 12, color: colors.INK_SOFT, fontWeight: "600", marginBottom: 8 },
    codeValue: { fontSize: 32, fontWeight: "800", color: colors.SANGRIA, letterSpacing: 4 },
    codeHint: { fontSize: 11.5, color: colors.INK_SOFT, marginTop: 10, textAlign: "center" },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.INK, marginBottom: 12 },
    memberRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.SURFACE, borderWidth: 1, borderColor: colors.LINE, borderRadius: 14,
      padding: 12, marginBottom: 10,
    },
    avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    memberName: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.INK },
    adminBadge: { backgroundColor: "rgba(194,59,50,0.18)", borderRadius: 12, paddingVertical: 3, paddingHorizontal: 9 },
    adminBadgeText: { fontSize: 10.5, fontWeight: "700", color: colors.SANGRIA },
  });
}