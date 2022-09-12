import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Article from "../components/Article";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const getArticles = () => {
    axios
      .get(
        "https://newsapi.org/v2/top-headlines?country=us&apiKey=0305c63f097d4a4099e1e7357c06a1a6",
        {
          params: {
            category: "technology",
          },
        }
      )
      .then((response) => {
        // en cas de réussite de la requête
        setArticles(response.data.articles);
      })
      .catch(function (error) {
        // en cas d’échec de la requête
        console.log(error);
      })
      .then(function () {
        // dans tous les cas
      });
  };

  useEffect(() => {
    getArticles();
  }, []);
  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <Article
            urlToImage={item.urlToImage}
            title={item.title}
            description={item.description}
            author={item.author}
            publishedAt={item.publishedAt}
          />
        )}
        keyExtractor={(item) => item.title}
      />
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
  },
});
