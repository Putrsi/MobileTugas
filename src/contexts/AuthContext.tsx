// contexts/AuthContext.tsx
// REPLACE isi file AuthContext.tsx yang lama dengan ini.
// Tambahan: family_id di profil user, plus createFamily() & joinFamily()

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

type UserProfile = {
  username: string;
  unlocked_themes: string[];
  family_id: string | null;
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  unlockTheme: (themeId: string) => Promise<void>;
  createFamily: (name: string) => Promise<string>; // return kode grup yang baru dibuat
  joinFamily: (code: string) => Promise<void>;
};

const SESSION_KEY = "rumahtugas_session_username";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateCode() {
  // Kode 6 karakter, huruf besar + angka, gampang diketik manual
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I biar gak ketuker
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (username: string) => {
    const { data } = await supabase
      .from("users")
      .select("username, unlocked_themes, family_id")
      .eq("username", username)
      .single();
    return data as UserProfile | null;
  };

  useEffect(() => {
    (async () => {
      const savedUsername = await AsyncStorage.getItem(SESSION_KEY);
      if (savedUsername) {
        const data = await fetchProfile(savedUsername);
        if (data) setUser(data);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("username, password, unlocked_themes, family_id")
      .eq("username", username)
      .single();

    if (error || !data) throw new Error("USER_NOT_FOUND");
    if (data.password !== password) throw new Error("WRONG_PASSWORD");

    await AsyncStorage.setItem(SESSION_KEY, data.username);
    setUser({
      username: data.username,
      unlocked_themes: data.unlocked_themes ?? ["dark"],
      family_id: data.family_id ?? null,
    });
  };

  const signup = async (username: string, password: string) => {
    const { data: existing } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single();

    if (existing) throw new Error("USER_EXISTS");

    const { data, error } = await supabase
      .from("users")
      .insert({ username, password, unlocked_themes: ["dark"], family_id: null })
      .select()
      .single();

    if (error || !data) throw new Error("SIGNUP_FAILED");

    await AsyncStorage.setItem(SESSION_KEY, data.username);
    setUser({ username: data.username, unlocked_themes: data.unlocked_themes, family_id: null });
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const unlockTheme = async (themeId: string) => {
    if (!user) return;
    const updated = Array.from(new Set([...user.unlocked_themes, themeId]));

    const { error } = await supabase
      .from("users")
      .update({ unlocked_themes: updated })
      .eq("username", user.username);

    if (!error) setUser({ ...user, unlocked_themes: updated });
  };

  const createFamily = async (name: string) => {
    if (!user) throw new Error("NOT_LOGGED_IN");

    const code = generateCode();
    const { data: family, error: famErr } = await supabase
      .from("families")
      .insert({ name, code })
      .select()
      .single();

    if (famErr || !family) throw new Error("CREATE_FAILED");

    const { error: userErr } = await supabase
      .from("users")
      .update({ family_id: family.id })
      .eq("username", user.username);

    if (userErr) throw new Error("CREATE_FAILED");

    setUser({ ...user, family_id: family.id });
    return code;
  };

  const joinFamily = async (code: string) => {
    if (!user) throw new Error("NOT_LOGGED_IN");

    const { data: family, error: famErr } = await supabase
      .from("families")
      .select("id")
      .eq("code", code.toUpperCase())
      .single();

    if (famErr || !family) throw new Error("CODE_NOT_FOUND");

    const { error: userErr } = await supabase
      .from("users")
      .update({ family_id: family.id })
      .eq("username", user.username);

    if (userErr) throw new Error("JOIN_FAILED");

    setUser({ ...user, family_id: family.id });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, unlockTheme, createFamily, joinFamily }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}