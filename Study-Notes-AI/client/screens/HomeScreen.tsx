import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { saveNote } from "@/lib/storage";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

import appIcon from "../../assets/images/icon.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 25,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newImages].slice(0, 25));
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setSelectedImages((prev) =>
        [...prev, result.assets[0].uri].slice(0, 25)
      );
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const processImages = async () => {
    if (selectedImages.length === 0) return;

    setIsProcessing(true);
    setProcessingStatus("Processing images with OCR...");

    try {
      const formData = new FormData();
      for (let i = 0; i < selectedImages.length; i++) {
        const uri = selectedImages[i];
        const filename = uri.split("/").pop() || `image_${i}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("images", {
          uri,
          name: filename,
          type,
        } as unknown as Blob);
      }

      setProcessingStatus("Generating exam notes with AI...");

      const response = await fetch(new URL("/api/generate-notes", getApiUrl()).toString(), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate notes");
      }

      const data = await response.json();

      const savedNote = await saveNote({
        title: data.title || "Untitled Note",
        content: data.content,
        sourceType: "ocr",
      });

      setSelectedImages([]);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      navigation.navigate("NoteDetail", { noteId: savedNote.id });
    } catch (error) {
      console.error("Error processing images:", error);
      setProcessingStatus("Error processing images. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image source={appIcon} style={styles.appIcon} />
          <ThemedText type="h2">Exam Notes</ThemedText>
          <ThemedText
            type="body"
            style={[styles.subtitle, { color: theme.textSecondary }]}
          >
            Convert textbook photos into exam-ready revision notes
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Add Images
          </ThemedText>
          <ThemedText
            type="small"
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            Upload up to 25 textbook pages or study materials
          </ThemedText>

          <View style={styles.buttonRow}>
            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: theme.link },
              ]}
              onPress={pickImages}
              disabled={isProcessing}
            >
              <Ionicons name="images-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Gallery</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={takePhoto}
              disabled={isProcessing}
            >
              <Ionicons name="camera-outline" size={20} color={theme.text} />
              <ThemedText style={[styles.buttonText, { color: theme.text }]}>
                Camera
              </ThemedText>
            </Pressable>
          </View>

          {selectedImages.length > 0 ? (
            <View style={styles.imageGrid}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.thumbnail} />
                  <Pressable
                    style={[
                      styles.removeButton,
                      { backgroundColor: theme.error },
                    ]}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          {selectedImages.length > 0 ? (
            <View style={styles.imageCount}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {selectedImages.length} of 25 images selected
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Pressable
            style={[
              styles.generateButton,
              {
                backgroundColor:
                  selectedImages.length > 0 && !isProcessing
                    ? theme.link
                    : theme.backgroundSecondary,
              },
            ]}
            onPress={processImages}
            disabled={selectedImages.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons
                name="flash-outline"
                size={20}
                color={selectedImages.length > 0 ? "#FFFFFF" : theme.textSecondary}
              />
            )}
            <ThemedText
              style={[
                styles.generateButtonText,
                {
                  color:
                    selectedImages.length > 0 && !isProcessing
                      ? "#FFFFFF"
                      : theme.textSecondary,
                },
              ]}
            >
              {isProcessing ? processingStatus : "Generate Exam Notes"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable
            style={[
              styles.textInputButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={() => navigation.navigate("CreateNote")}
          >
            <Ionicons name="create-outline" size={20} color={theme.text} />
            <ThemedText style={{ color: theme.text }}>
              Or paste text to convert
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
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
  header: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    marginTop: -Spacing.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  imageContainer: {
    position: "relative",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  imageCount: {
    alignItems: "center",
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
  textInputButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
