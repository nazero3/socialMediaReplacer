import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import type { ArticleSummary } from '@smr/types';
import { getBookmarks, getHistory } from '../../src/lib/storage';
import { ArticleListItem } from '../../src/components/ArticleListItem';
import { useAppTheme } from '../../src/lib/theme';

export default function BookmarksScreen() {
  const t = useAppTheme();
  const [items, setItems] = useState<ArticleSummary[]>([]);

  const load = useCallback(async () => {
    const slugs = new Set(await getBookmarks());
    const history = await getHistory();
    setItems(history.filter((h) => slugs.has(h.slug)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: t.spacing.lg }}
        ListHeaderComponent={
          <View style={{ marginBottom: t.spacing.lg }}>
            <Text
              style={{
                fontFamily: t.fonts.heading,
                color: t.colors.text,
                fontSize: t.fontSizes.xxl,
              }}
            >
              Saved
            </Text>
            <Text style={{ color: t.colors.textMuted, marginTop: t.spacing.xs }}>
              Bookmarks live on this device only.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={{ color: t.colors.textMuted }}>
            Nothing saved yet. Tap the bookmark on an article to keep it for later.
          </Text>
        }
        renderItem={({ item }) => (
          <ArticleListItem
            article={item}
            onPress={() => router.push(`/article/${item.slug}`)}
          />
        )}
      />
    </View>
  );
}
