import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getAllNotes, deleteNote, SavedNote } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

import emptyImage from "../../assets/images/empty-notes.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = async () => {
    const allNotes = await getAllNotes();
    setNotes(allNotes);
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    loadNotes();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderNoteItem = ({ item }: { item: SavedNote }) => (
    <Pressable
      style={[styles.noteCard, { backgroundColor: theme.backgroundSecondary }]}
      onPress={() => navigation.navigate("NoteDetail", { noteId: item.id })}
    >
      <View style={styles.noteContent}>
        <View style={styles.noteHeader}>
          <MaterialIcons
            name={item.sourceType === "ocr" ? "photo-camera" : "edit"}
            size={16}
            color={theme.link}
          />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {formatDate(item.createdAt)}
          </ThemedText>
        </View>
        <ThemedText type="h4" numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText
          type="small"
          numberOfLines={2}
          style={{ color: theme.textSecondary }}
        >
          {item.content.substring(0, 150)}...
        </ThemedText>
      </View>
      <Pressable
        style={[styles.deleteButton, { backgroundColor: theme.error }]}
        onPress={() => handleDelete(item.id)}
      >
        <MaterialIcons name="delete-outline" size={16} color="#FFFFFF" />
      </Pressable>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Image source={emptyImage} style={styles.emptyImage} />
      <ThemedText type="h3" style={styles.emptyTitle}>
        No notes yet
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        Create your first exam note by uploading textbook images or pasting
        study text
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <ThemedText type="h2">My Notes</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </ThemedText>
      </View>

      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  noteCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  noteContent: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  deleteButton: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing["4xl"],
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
  },
});
