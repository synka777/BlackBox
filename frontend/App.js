import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from "react-native";
import Home from "./src/screens/home";
import Create from "./src/screens/create";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import LogoBar from "./src/components/logoBar";
import SearchScreen from "./src/screens/SearchScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <LogoBar />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            elevation: 0,
            backgroundColor: "#B38B6D",
            borderRadius: 15,

            height: 70,
            ...styles.shadow,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 5,
                }}
              >
                <ImageBackground
                  source={require("./assets/accueil.png")}
                  resizeMode="contain"
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
                <Text
                  style={{
                    color: focused ? "#0048BA" : "white",
                    fontSize: 12,
                  }}
                >
                  Acceuil
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Create"
          component={Create}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 5,
                }}
              >
                <ImageBackground
                  source={require("./assets/plus.png")}
                  resizeMode="contain"
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
                <Text
                  style={{
                    color: focused ? "#e32f45" : "white",
                    fontSize: 12,
                  }}
                >
                  Ajouter
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  top: 5,
                }}
              >
                <ImageBackground
                  source={require("./assets/search.png")}
                  resizeMode="contain"
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
                <Text
                  style={{
                    color: focused ? "#e32f45" : "white",
                    fontSize: 12,
                  }}
                >
                  Recherche
                </Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 5,
  },
});
