import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { saveNote } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/* ---------------- API URLS ---------------- */

// 🤗 HuggingFace OCR backend (replace later)
const OCR_API = "https://ayan8901-exam-notes-ocr.hf.space/ocr";

// 🚂 Railway notes backend
const NOTES_API =
  "https://exam-notes-backend-v2-production.up.railway.app/api/generate-notes-from-text";

export default function CreateNoteScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [textInput, setTextInput] = useState("");
  const [isOCRLoading, setIsOCRLoading] = useState(false);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- OCR FUNCTION ---------------- */

  const pickImageAndOCR = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 1,
    });

    if (result.canceled) return;

    setIsOCRLoading(true);
    setError("");

    try {
      const image = result.assets[0];

      const formData = new FormData();
      formData.append("file", {
        uri:
          Platform.OS === "android"
            ? image.uri
            : image.uri.replace("file://", ""),
        name: "image.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(OCR_API, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.text) {
        setTextInput(data.text);
      } else {
        setError("OCR returned no text");
      }
    } catch (e) {
      console.log(e);
      setError("OCR failed");
    } finally {
      setIsOCRLoading(false);
    }
  };

  /* ---------------- TEXT NOTES FUNCTION ---------------- */

  const generateNotes = async () => {
    if (!textInput.trim()) return;

    setIsNotesLoading(true);
    setError("");

    try {
      const response = await fetch(NOTES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput.trim() }),
      });

      if (!response.ok) throw new Error("Failed to generate notes");

      const data = await response.json();

      const savedNote = await saveNote({
        title: data.title || "Untitled Note",
        content: data.content,
        sourceType: "text",
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      navigation.replace("NoteDetail", { noteId: savedNote.id });
    } catch (err) {
      console.error("Error generating notes:", err);
      setError("Failed to generate notes. Please try again.");
    } finally {
      setIsNotesLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.section}>
          <ThemedText type="h4">Paste Text OR Upload Image</ThemedText>
        </View>

        {/* OCR BUTTON */}
        <Pressable
          style={[styles.generateButton, { backgroundColor: theme.backgroundSecondary }]}
          onPress={pickImageAndOCR}
        >
          {isOCRLoading ? (
            <ActivityIndicator />
          ) : (
            <MaterialIcons name="image" size={20} color={theme.text} />
          )}
          <ThemedText style={{ color: theme.text }}>
            {isOCRLoading ? "Processing Image..." : "Upload Image for OCR"}
          </ThemedText>
        </Pressable>

        {/* TEXT INPUT */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Text will appear here..."
            placeholderTextColor={theme.textSecondary}
            value={textInput}
            onChangeText={setTextInput}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* ERROR */}
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.error + "20" }]}>
            <MaterialIcons name="error-outline" size={16} color={theme.error} />
            <ThemedText type="small" style={{ color: theme.error }}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        {/* GENERATE NOTES */}
        <Pressable
          style={[
            styles.generateButton,
            {
              backgroundColor:
                textInput.trim() && !isNotesLoading ? theme.link : theme.backgroundSecondary,
            },
          ]}
          onPress={generateNotes}
          disabled={!textInput.trim() || isNotesLoading}
        >
          {isNotesLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialIcons name="bolt" size={20} color="#fff" />
          )}
          <ThemedText style={styles.generateButtonText}>
            {isNotesLoading ? "Generating..." : "Generate Notes"}
          </ThemedText>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.xl },
  section: { gap: Spacing.xs },
  inputContainer: { gap: Spacing.sm },
  textInput: {
    minHeight: 200,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  generateButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});