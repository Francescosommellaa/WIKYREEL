import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  fetchMultipleArticles,
  WikipediaArticle,
} from "../../../../services/wikipediaApi";

import Icon from "../../ui/Icon";

const OVERLAY_HEIGHT = 160;

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const ITEM_HEIGHT = Dimensions.get("window").height - insets.bottom;

  const [articles, setArticles] = useState<WikipediaArticle[]>([]);
  const [nextArticles, setNextArticles] = useState<WikipediaArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const scrollY = useRef(new Animated.Value(-1000)).current;
  useEffect(() => {
    if (!loading) {
      scrollY.setValue(0);
    }
  }, [loading]);

  const pullDistance = useRef(0);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (!viewableItems || viewableItems.length === 0) return;

    const index = viewableItems[0].index;
    const lastIndex = articles.length - 1;
    const prefetchTriggerIndex = lastIndex - 2;

    setCurrentIndex(index);

    if (index === prefetchTriggerIndex) {
      loadMoreArticles();
    }
  }).current;

  useEffect(() => {
    loadInitialArticles();
  }, []);

  async function loadInitialArticles() {
    setLoading(true);
    const initial = await fetchMultipleArticles(5, "it");
    const next = await fetchMultipleArticles(5, "it");
    setArticles(initial);
    setNextArticles(next);
    setLoading(false);
  }

  async function refreshArticles() {
    if (refreshing) return;
    setRefreshing(true);

    const fresh = await fetchMultipleArticles(5, "it");
    const prefetch = await fetchMultipleArticles(5, "it");

    setArticles(fresh);
    setNextArticles(prefetch);
    setCurrentIndex(0);
    setRefreshing(false);
  }

  async function loadMoreArticles() {
    if (isFetchingMore || nextArticles.length === 0) return;
    setIsFetchingMore(true);

    setArticles((prev) => [...prev, ...nextArticles]);

    fetchMultipleArticles(5, "it").then((newArticles) => {
      setNextArticles(newArticles);
      setIsFetchingMore(false);
    });
  }

  const styles = StyleSheet.create({
    page: {
      height: ITEM_HEIGHT,
      position: "relative",
      backgroundColor: "#000",
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },
    gradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.28)",
      zIndex: 1,
    },
    overlay: {
      position: "absolute",
      bottom: insets.bottom + 24,
      left: 0,
      right: 0,
      zIndex: 2,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      margin: 24,
    },
    text: {
      maxWidth: "80%",
    },
    category: {
      color: "#2DFFD5",
      fontWeight: "600",
      fontSize: 15,
      marginBottom: 4,
    },
    title: {
      color: "#fff",
      fontSize: 32,
      fontWeight: "bold",
      marginBottom: 8,
    },
    intro: {
      color: "#D1D4D8",
      fontSize: 16,
    },
    actionsContainer: {
      flexDirection: "column",
      gap: 32,
      alignItems: "flex-end",
      maxWidth: "20%",
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    blurOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
    },
    darkOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      zIndex: 2,
    },
  });

  const renderItem = ({
    item,
    index,
  }: {
    item: WikipediaArticle;
    index: number;
  }) => {
    const isCurrent = index === currentIndex;

    // Solo se è l'articolo attivo, calcoliamo opacità dinamica
    const overlayOpacity = isCurrent
      ? scrollY.interpolate({
          inputRange: [
            (index - 1) * ITEM_HEIGHT + ITEM_HEIGHT * 0.28,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT - ITEM_HEIGHT * 0.28,
          ],
          outputRange: [0.8, 0, 0.8],
          extrapolate: "clamp",
        })
      : new Animated.Value(0);

    return (
      <View style={styles.page}>
        {item.thumbnail?.source && (
          <Image
            source={{ uri: item.thumbnail.source }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Animated.View
          style={[styles.blurOverlay, { opacity: overlayOpacity }]}
        >
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.darkOverlay} />
        </Animated.View>

        <View style={styles.gradientOverlay} />

        <View style={styles.overlay}>
          {/* 📄 testo */}
          <View style={styles.text}>
            <Text style={styles.category}>Categoria</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.intro}>{item.extract}</Text>
          </View>

          {/* 👍 Azioni */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => console.log("Like")}>
              <Icon name="like" size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log("Comment")}>
              <Icon name="comment" size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log("Save")}>
              <Icon name="save" size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log("Share")}>
              <Icon name="share" size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log("Expand")}>
              <Icon name="expand" size={28} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const animatedRefreshStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-100, 0],
          outputRange: [60, -100],
          extrapolate: "clamp",
        }),
      },
    ],
    opacity: scrollY.interpolate({
      inputRange: [-100, -30],
      outputRange: [1, 0],
      extrapolate: "clamp",
    }),
  };

  return (
    <>
      {/* 🔄 Pull-to-refresh */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: insets.top + 30,
            left: 0,
            right: 0,
            zIndex: 10,
            alignItems: "center",
          },
          animatedRefreshStyle,
        ]}
      >
        <ActivityIndicator size="small" color="#00ccff" />
      </Animated.View>

      <Animated.FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
              const offsetY = e.nativeEvent.contentOffset.y;
              pullDistance.current = offsetY;
            },
          }
        )}
        onScrollEndDrag={() => {
          if (
            pullDistance.current <= -70 &&
            currentIndex === 0 &&
            !refreshing
          ) {
            refreshArticles();
          }
        }}
        onEndReached={loadMoreArticles}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingMore ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null
        }
      />
    </>
  );
}
