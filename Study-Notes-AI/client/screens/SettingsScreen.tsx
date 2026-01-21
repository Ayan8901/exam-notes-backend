import React from "react";
import { View, StyleSheet, Pressable, Switch, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useThemeMode } from "@/hooks/useThemeMode";
import { Spacing, BorderRadius } from "@/constants/theme";

import appIcon from "../../assets/images/icon.png";

type ThemeOption = "light" | "dark" | "system";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();

  const themeOptions: { value: ThemeOption; label: string; icon: "sunny-outline" | "moon-outline" | "phone-portrait-outline" }[] = [
    { value: "light", label: "Light", icon: "sunny-outline" },
    { value: "dark", label: "Dark", icon: "moon-outline" },
    { value: "system", label: "System", icon: "phone-portrait-outline" },
  ];

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
          <ThemedText type="h2">Settings</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Appearance
          </ThemedText>

          <View
            style={[
              styles.optionGroup,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            {themeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionItem,
                  themeMode === option.value && {
                    backgroundColor: theme.link,
                  },
                ]}
                onPress={() => setThemeMode(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={themeMode === option.value ? "#FFFFFF" : theme.text}
                />
                <ThemedText
                  style={{
                    color: themeMode === option.value ? "#FFFFFF" : theme.text,
                    fontWeight: themeMode === option.value ? "600" : "400",
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            About
          </ThemedText>

          <View
            style={[
              styles.aboutCard,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <View style={styles.aboutRow}>
              <ThemedText style={{ color: theme.textSecondary }}>
                Version
              </ThemedText>
              <ThemedText>1.0.0</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.aboutRow}>
              <ThemedText style={{ color: theme.textSecondary }}>
                Developed by
              </ThemedText>
              <ThemedText>Exam Notes Team</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText
            type="small"
            style={[styles.footerText, { color: theme.textSecondary }]}
          >
            Exam Notes uses AI to convert your study materials into
            exam-focused revision notes. Your notes are stored locally on your
            device.
          </ThemedText>
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
    gap: Spacing["2xl"],
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  optionGroup: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  optionItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  aboutCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  footerText: {
    textAlign: "center",
    lineHeight: 20,
  },
});
