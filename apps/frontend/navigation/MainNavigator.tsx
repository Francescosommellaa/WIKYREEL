import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { enableScreens } from "react-native-screens";

// Importazione delle schermate
import FeedScreen from "../screens/main/FeedScreen";
import SearchScreen from "../screens/main/SearchScreen";
import PremiumScreen from "../screens/main/PremiumScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

// Importazione delle icone SVG (React component via SVGR o simile)
import FeedIcon from "../assets/icons/feed.svg";
import FeedActiveIcon from "../assets/icons/feed-active.svg";
import SearchIcon from "../assets/icons/search.svg";
import SearchActiveIcon from "../assets/icons/search-active.svg";
import PremiumIcon from "../assets/icons/star.svg";
import PremiumActiveIcon from "../assets/icons/star-active.svg";
import ProfileIcon from "../assets/icons/profile.svg";
import ProfileActiveIcon from "../assets/icons/profile-active.svg";

// Abilitazione ottimizzata della gestione delle schermate (migliora le performance)
enableScreens();

// Creazione del Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Mappa icone associate a ogni tab (default e attiva)
// Usiamo `as const` per permettere a TypeScript di inferire correttamente i tipi letterali
const icons = {
  Feed: { default: FeedIcon, active: FeedActiveIcon },
  Search: { default: SearchIcon, active: SearchActiveIcon },
  Premium: { default: PremiumIcon, active: PremiumActiveIcon },
  Profile: { default: ProfileIcon, active: ProfileActiveIcon },
} as const;

// Componente principale che gestisce la navigazione con le tab
export default function BottomNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderTopWidth: 0,
            elevation: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            paddingtop: 10,
          },
          tabBarIcon: ({ focused }) => {
            const iconSet = icons[route.name as keyof typeof icons];
            const IconComponent = focused ? iconSet.active : iconSet.default;
            return (
              <IconComponent width={28} height={28} style={{ marginTop: 24 }} />
            );
          },
        })}
      >
        {/* Definizione delle schermate associate alle tab */}
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Premium" component={PremiumScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
