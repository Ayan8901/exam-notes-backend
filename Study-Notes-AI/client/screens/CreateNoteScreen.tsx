import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { saveNote } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateNoteScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const generateNotes = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch(
        new URL("/api/generate-notes-from-text", getApiUrl()).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: textInput.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate notes");
      }

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
      setIsProcessing(false);
    }
  };

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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="h4">Paste Your Study Text</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Enter textbook content, lecture notes, or any study material to
            convert into exam-focused notes
          </ThemedText>
        </View>

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
            placeholder="Paste your study text here..."
            placeholderTextColor={theme.textSecondary}
            value={textInput}
            onChangeText={setTextInput}
            multiline
            textAlignVertical="top"
          />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {textInput.length} characters
          </ThemedText>
        </View>

        {error ? (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: theme.error + "20" },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
            <ThemedText type="small" style={{ color: theme.error }}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <Pressable
          style={[
            styles.generateButton,
            {
              backgroundColor:
                textInput.trim() && !isProcessing
                  ? theme.link
                  : theme.backgroundSecondary,
            },
          ]}
          onPress={generateNotes}
          disabled={!textInput.trim() || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons
              name="flash-outline"
              size={20}
              color={textInput.trim() ? "#FFFFFF" : theme.textSecondary}
            />
          )}
          <ThemedText
            style={[
              styles.generateButtonText,
              {
                color:
                  textInput.trim() && !isProcessing
                    ? "#FFFFFF"
                    : theme.textSecondary,
              },
            ]}
          >
            {isProcessing ? "Generating Notes..." : "Generate Exam Notes"}
          </ThemedText>
        </Pressable>

        <View style={styles.tips}>
          <ThemedText type="h4" style={styles.tipsTitle}>
            Tips for Best Results
          </ThemedText>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Include key definitions and concepts
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Add formulas and important equations
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Include examples when available
            </ThemedText>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.xs,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  textInput: {
    minHeight: 200,
    maxHeight: 300,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    fontSize: 16,
    lineHeight: 24,
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
  generateButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  tips: {
    gap: Spacing.md,
  },
  tipsTitle: {
    marginBottom: Spacing.xs,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
