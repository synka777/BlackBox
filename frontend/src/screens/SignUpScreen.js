import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import React from "react";
import Logo from "../../assets/icon1.png";
import CustomButton from "../components/CustomButton/CustomButton";

const onSignUpPressed = () => {
  console.warn("Sign up");
};

const SignUpScreen = () => {
  const { height } = useWindowDimensions();

  return (
    <View style={styles.root}>
      <Image
        source={Logo}
        style={[styles.logo, { height: height * 0.3 }]}
        resizeMode="contain"
      />

      <Text style={styles.text}>
        Bienvenue sur {""}
        <Text style={styles.highlight1}>Black</Text>
        <Text>Box</Text>
      </Text>
      <CustomButton onPress={onSignUpPressed} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    padding: 20,
    marginTop: "25%",
  },
  logo: {
    width: "70%",
    maxWidth: 400,
    maxHeight: 300,
  },
  text: {
    fontSize: 40,
    color: "white",
    paddingTop: 20,
    marginVertical: 20,
    textAlign: "center",
  },
  highlight1: {
    color: "red",
  },
});

export default SignUpScreen;
