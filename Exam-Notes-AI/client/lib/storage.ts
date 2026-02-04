import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_STORAGE_KEY = "@exam_notes_saved";

export interface SavedNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  sourceType: "ocr" | "text";
}

export async function getAllNotes(): Promise<SavedNote[]> {
  try {
    const stored = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (e) {
    console.error("Failed to load notes:", e);
    return [];
  }
}

export async function saveNote(note: Omit<SavedNote, "id" | "createdAt">): Promise<SavedNote> {
  try {
    const notes = await getAllNotes();
    const newNote: SavedNote = {
      ...note,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    return newNote;
  } catch (e) {
    console.error("Failed to save note:", e);
    throw e;
  }
}

export async function deleteNote(id: string): Promise<void> {
  try {
    const notes = await getAllNotes();
    const filtered = notes.filter((n) => n.id !== id);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete note:", e);
    throw e;
  }
}

export async function getNote(id: string): Promise<SavedNote | null> {
  try {
    const notes = await getAllNotes();
    return notes.find((n) => n.id === id) || null;
  } catch (e) {
    console.error("Failed to get note:", e);
    return null;
  }
}
