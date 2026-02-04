import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import NoteDetailScreen from "@/screens/NoteDetailScreen";
import CreateNoteScreen from "@/screens/CreateNoteScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  NoteDetail: { noteId: string };
  CreateNote: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{
          headerTitle: "Note",
        }}
      />
      <Stack.Screen
        name="CreateNote"
        component={CreateNoteScreen}
        options={{
          headerTitle: "Create Note",
        }}
      />
    </Stack.Navigator>
  );
}
