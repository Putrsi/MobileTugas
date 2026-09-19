
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, StyleSheet, StatusBar, ColorValue } from "react-native";
import { SURFACE, SANGRIA, LINE, INK_SOFT } from "./theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: SANGRIA,
        tabBarInactiveTintColor: INK_SOFT,
        tabBarStyle: {
          backgroundColor: SURFACE,
          borderTopColor: LINE,
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color }) => <Dot color={color} />,
        }}
      />
      <Tabs.Screen
        name="jadwal"
        options={{
          title: "Jadwal",
          tabBarIcon: ({ color }) => <Dot color={color} />,
        }}
      />
      <Tabs.Screen
        name="peringkat"
        options={{
          title: "Peringkat",
          tabBarIcon: ({ color }) => <Dot color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <Dot color={color} />,
        }}
      />
    </Tabs>
  );
}

function Dot({ color }: { color: ColorValue }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  dot: { width: 18, height: 18, borderRadius: 5 },
});