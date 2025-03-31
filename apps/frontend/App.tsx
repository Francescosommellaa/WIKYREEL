import React from "react";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./navigation/MainNavigator";

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
