import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { getNote, SavedNote } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NoteDetailRouteProp = RouteProp<RootStackParamList, "NoteDetail">;

/* ---------- helpers ---------- */
const stripMarkdown = (text: string) =>
  text.replace(/[*_`#]/g, "");

const toast = (msg: string) => {
  Platform.OS === "android"
    ? ToastAndroid.show(msg, ToastAndroid.SHORT)
    : Alert.alert(msg);
};

export default function NoteDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<NoteDetailRouteProp>();
  const navigation = useNavigation();

  const [note, setNote] = useState<SavedNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
  }, [route.params?.noteId]);

  const loadNote = async () => {
    setLoading(true);

    if (!route.params?.noteId) {
      setNote(null);
      setLoading(false);
      return;
    }

    const data = await getNote(route.params.noteId);
    setNote(data ?? null);
    setLoading(false);

    navigation.setOptions({ title: "" });
  };

  /* ---------- actions ---------- */
  const copy = async () => {
    if (!note) return;
    await Clipboard.setStringAsync(note.content);
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
    toast("Copied");
  };

  const exportPDF = async () => {
    if (!note) return;

    const html = `
      <html>
        <body style="font-family:sans-serif;padding:40px;">
          <h1 style="color:#2563EB;">${note.title}</h1>
          ${note.content
            .split("\n")
            .map((l) => `<p>${stripMarkdown(l)}</p>`)
            .join("")}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading note…</ThemedText>
      </ThemedView>
    );
  }

  /* ---------- EMPTY ---------- */
  if (!note) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>No note found</ThemedText>
      </ThemedView>
    );
  }

  /* ---------- MAIN UI ---------- */
  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 56 }, // ✅ +2 SPACE FIX
        ]}
      >
        <ThemedText type="h2" style={{ color: theme.link }}>
          {note.title}
        </ThemedText>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 180 },
        ]}
      >
        {note.content.split("\n").map((line, i) => (
          <ThemedText key={i} style={styles.text}>
            {stripMarkdown(line)}
          </ThemedText>
        ))}
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Action icon="content-copy" label="Copy" onPress={copy} />
        <Action icon="share" label="Share" onPress={exportPDF} />
        <Action icon="picture-as-pdf" label="PDF" onPress={exportPDF} />
      </View>
    </ThemedView>
  );
}

/* ---------- ACTION BUTTON ---------- */
function Action({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.action,
        { backgroundColor: theme.link },
      ]}
    >
      <MaterialIcons name={icon} size={18} color="#fff" />
      <ThemedText style={styles.actionText}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  content: {
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  actionText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
});
