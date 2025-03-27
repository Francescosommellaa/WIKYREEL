import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FeedScreen from "../screens/main/FeedScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import PremiumScreen from "../screens/premium/PremiumScreen";
import { enableScreens } from "react-native-screens";
enableScreens();

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Premium" component={PremiumScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
