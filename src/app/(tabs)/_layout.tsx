
import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

const ORANGE = "#FF7A1A";
const INACTIVE_BG = "#2A3441";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home",
  jadwal: "calendar",
  peringkat: "trophy",
  profil: "person",
};

const LABELS: Record<string, string> = {
  index: "Beranda",
  jadwal: "Jadwal",
  peringkat: "Peringkat",
  profil: "Profil",
};

function CustomTabBar({ state, navigation }: any) {
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.SURFACE, borderTopColor: colors.LINE }]}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const iconName = ICONS[route.name] ?? "ellipse";
        const label = LABELS[route.name] ?? route.name;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(route.name)}
          >
            <View style={[styles.iconCircle, focused && styles.iconCircleActive]}>
              <Ionicons name={iconName} size={22} color="#fff" />
            </View>
            <Text
              style={[styles.label, { color: focused ? ORANGE : colors.INK_SOFT }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="jadwal" />
      <Tabs.Screen name="peringkat" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
 bar: {
  flexDirection: "row",
  borderTopWidth: 1,
  height: 84,
  paddingTop: 18,
  paddingBottom: 14,
},
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: INACTIVE_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleActive: { backgroundColor: ORANGE },
  label: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 64,
  },
});