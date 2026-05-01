import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import type { ArticleSummary } from '@smr/types';
import { CATEGORY_LABELS, isCategory } from '@smr/types';
import { getArticles } from '../../src/lib/api';
import { ArticleListItem } from '../../src/components/ArticleListItem';
import { useAppTheme } from '../../src/lib/theme';

export default function CategoryScreen() {
  const t = useAppTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const cat = slug && isCategory(slug) ? slug : null;
  const [items, setItems] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cat) return;
    (async () => {
      try {
        const res = await getArticles(cat);
        setItems(res.items);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [cat]);

  if (!cat) {
    return (
      <View style={{ flex: 1, padding: t.spacing.lg, backgroundColor: t.colors.background }}>
        <Text style={{ color: t.colors.text }}>Unknown category.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <Stack.Screen options={{ title: CATEGORY_LABELS[cat] }} />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: t.spacing.lg }}
          ListEmptyComponent={
            <Text style={{ color: t.colors.textMuted }}>Nothing here yet.</Text>
          }
          renderItem={({ item }) => (
            <ArticleListItem
              article={item}
              onPress={() => router.push(`/article/${item.slug}`)}
            />
          )}
        />
      )}
    </View>
  );
}
