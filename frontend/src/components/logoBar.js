import React from "react";
import {
  SafeAreaView,
  Dimensions,
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableHighlight,
  ScrollView,
} from "react-native";

import "react-native-gesture-handler";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const LogoBar = () => {
  return (
    <SafeAreaView style={styles.header_safe_area}>
      <View style={styles.header}>
        <View style={styles.header_inner}>
          <View>
            <Image
              source={require("../../assets/Logo_Blackbox.png")}
              style={{ width: 152, height: 40 }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LogoBar;

const styles = StyleSheet.create({
  header_safe_area: {
    zIndex: 1000,
    backgroundColor: "black",
  },
  header: {
    marginTop: 35,
    height: 50,
    paddingHorizontal: 16,
  },
  header_inner: {
    flex: 1,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
});
