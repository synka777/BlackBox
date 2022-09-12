import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import axios from "axios";
import Article from "../components/Article";

const SearchScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [articles, setArticles] = useState([]);

  const searchArticles = () => {
    axios
      .get(
        "https://newsapi.org/v2/top-headlines?country=us&apiKey=0305c63f097d4a4099e1e7357c06a1a6",
        {
          params: {
            category: "technology",
            q: searchText,
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

  return (
    <View style={styles.container}>
      <SearchBar
        searchText={searchText}
        setSearchText={setSearchText}
        onSubmit={searchArticles}
      />
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
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
