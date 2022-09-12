import { View, Text, StyleSheet, TextInput } from "react-native";
import React from "react";

const SearchBar = (props) => {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search"
        style={styles.input}
        value={props.searchText}
        onChangeText={(text) => props.setSearchText(text)}
        onSubmitEditing={props.onSubmit}
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  input: {
    backgroundColor: "white",
    padding: 7,
    borderRadius: 10,
    color: "black",
    borderWidth: 1,
  },
});
