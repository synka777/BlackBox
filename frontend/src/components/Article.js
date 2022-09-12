import { Text, View, StyleSheet, SafeAreaView, Image } from "react-native";
import React from "react";
import moment from "moment";

const Article = (props) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* image */}
      <Image
        source={{
          uri: props.urlToImage,
        }}
        style={styles.image}
      />
      <View style={{ padding: 20 }}>
        {/* titre */}
        <Text style={styles.title}>{props.title}</Text>

        {/* description */}
        <Text style={styles.description}>{props.description}</Text>

        {/* auteur et date */}
        <View style={styles.data}>
          <Text style={styles.heading}>
            Écrit par: <Text style={styles.author}>{props.author}</Text>
          </Text>
          <Text style={styles.date}>
            {moment(props.publishedAt).format("MMM Do YY")}{" "}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Article;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 30,
    shadowColor: "black",
    shadowOffset: {
      height: 5,
      width: 5,
    },
    backgroundColor: "#fff",
    shadowOpacity: 2,
    shadowRadius: 3.5,
    elevation: 5,
    marginTop: 20,
    marginBottom: 4,
  },
  image: {
    height: 200,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  description: {
    fontSize: 15,
    fontWeight: "400",
    marginTop: 10,
  },
  data: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  heading: {},
  author: {
    fontWeight: "bold",
    fontSize: 15,
  },
  date: {
    fontWeight: "bold",
    fontSize: 15,
  },
});
