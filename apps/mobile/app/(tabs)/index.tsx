import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { ArticleSummary } from '@smr/types';
import { getArticles } from '../../src/lib/api';
import { useAppTheme } from '../../src/lib/theme';
import { ArticleListItem } from '../../src/components/ArticleListItem';

export default function TodayScreen() {
  const t = useAppTheme();
  const [items, setItems] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const res = await getArticles();
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: t.spacing.lg, paddingBottom: t.spacing.xxxl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={t.colors.accent}
            />
          }
          ListHeaderComponent={
            <View style={{ marginBottom: t.spacing.lg }}>
              <Text
                style={{
                  fontFamily: t.fonts.heading,
                  color: t.colors.text,
                  fontSize: t.fontSizes.xxl,
                  marginBottom: t.spacing.sm,
                }}
              >
                Today
              </Text>
              <Text style={{ color: t.colors.textMuted, fontSize: t.fontSizes.sm }}>
                A finite list. Read what calls to you. Close the tab when you&apos;re done.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={{ color: t.colors.textMuted }}>
              {error ?? 'No articles yet. Run the worker to ingest sources.'}
            </Text>
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
