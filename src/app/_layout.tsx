// app/_layout.tsx
// REPLACE root layout yang lama.
// Tambahan: kalau user udah login tapi belum punya family_id,
// dilempar ke /join-family dulu sebelum boleh masuk ke (tabs).

import React from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { BG, SANGRIA } from "./(tabs)/theme";

function Gatekeeper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;

    const inLoginPage = segments[0] === "login";
    const inJoinFamilyPage = segments[0] === "join-family";

    if (!user && !inLoginPage) {
      router.replace("/login");
    } else if (user && !user.family_id && !inJoinFamilyPage) {
      // Sudah login tapi belum punya/join grup keluarga
      router.replace("/join-family");
    } else if (user && user.family_id && (inLoginPage || inJoinFamilyPage)) {
      // Sudah lengkap semua, tapi masih nyangkut di login/join-family
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={SANGRIA} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Gatekeeper>
          <Slot />
        </Gatekeeper>
      </ThemeProvider>
    </AuthProvider>
  );
}